require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const cors = require('cors');
const { fal } = require("@fal-ai/client");
const mongoose = require('mongoose');
const VideoJob = require('./models/VideoJob');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_API_KEY
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Upload video from Uploadcare to Cloudinary
app.post('/api/upload', async (req, res) => {
  try {
    const { uploadcareUrl } = req.body;

    if (!uploadcareUrl) {
      return res.status(400).json({ error: 'Uploadcare URL is required' });
    }

    // Fetch video from Uploadcare
    const result = await cloudinary.uploader.upload(uploadcareUrl, {
        resource_type: 'video',
        folder: 'videos'
      });
      

    res.json({
      message: 'Video uploaded successfully',
      cloudinaryUrl: result.secure_url,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// New transformation endpoint
app.post('/transform', async (req, res) => {
  try {
    const {
      prompt,
      num_inference_steps,
      aspect_ratio,
      resolution,
      num_frames,
      userId,
      userEmail,
    } = req.body;
    
    // Create initial job record
    const videoJob = await VideoJob.create({
      userId,
      status: 'processing',
      parameters: {
        prompt,
        num_inference_steps,
        aspect_ratio,
        resolution,
        num_frames
      }
    });

    // First part: FAL AI transformation
    const { request_id } = await fal.queue.submit("fal-ai/hunyuan-video", {
      input: {
        prompt,
        webhook: `${process.env.REACT_WEB_HOOK_URL}/webhook`
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(update.logs.map((log) => log.message));
        }
      },
    });
    
    // Update job with FAL request ID
    videoJob.falRequestId = request_id;
    await videoJob.save();

    // Monitor status
    let status = await fal.queue.status("fal-ai/hunyuan-video", {
      requestId: request_id,
      logs: true,
    });
    
    //remove this while loop if webhook is implemented
    while (status.status === "IN_PROGRESS" || status.status === "IN_QUEUE") {
      console.log("Waiting for the transformation to complete...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      status = await fal.queue.status("fal-ai/hunyuan-video", {
        requestId: request_id,
        logs: true,
      });
    }

    const result = await fal.queue.result("fal-ai/hunyuan-video", {
      requestId: request_id
    });

    console.log(result);

    if (result.data && result.data.video.url) {
      // Upload transformed video to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(result.data.video.url, {
        resource_type: 'video',
        folder: 'transformed-videos'
      });

      // Update job with success status and transformed URL
      videoJob.status = 'completed';
      videoJob.transformedUrl = cloudinaryResult.secure_url;
      await videoJob.save();

      res.json({
        message: 'Video transformation completed',
        result: {
          video: {
            url: cloudinaryResult.secure_url
          }
        }
      });
    } else {
      throw new Error('Transformation did not return a video URL');
    }

  } catch (error) {
    console.error('Error:', error);
    // Update job with failed status
    if (videoJob) {
      videoJob.status = 'failed';
      videoJob.logs.push({
        message: error.message || 'Video transformation failed'
      });
      await videoJob.save();
    }
    res.status(500).json({ error: 'Video transformation failed' });
  }
});

// Comment out the duplicate transform endpoint and related code
/*
const resultsCache = new Map();

app.post('/transform', async (req, res) => {
  try {
    const { prompt } = req.body;
    const { request_id } = await fal.queue.submit("fal-ai/flux/dev", {
      input: { prompt },
      webhookUrl: "https://your-ngrok-url.ngrok-free.app/webhook",
    });

    // Initialize cache entry
    resultsCache.set(request_id, {
      status: 'processing',
      imageUrl: null,
      error: null,
    });

    // Send request_id to frontend
    res.json({ requestId: request_id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { request_id, status, payload, error } = req.body;
    const cached = resultsCache.get(request_id) || {};

    if (status === 'OK') {
      cached.status = 'completed';
      cached.imageUrl = payload.images[0].url;
      cached.error = null;
    } else if (status === 'ERROR') {
      cached.status = 'error';
      cached.error = error || 'Unknown error';
    }

    resultsCache.set(request_id, cached);
    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//polling from frontend

app.get('/result/:requestId', (req, res) => {
  const { requestId } = req.params;
  const result = resultsCache.get(requestId);

  if (!result) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json(result);
});
*/

// Update history endpoint to use VideoJob model
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await VideoJob.find({ 
      userId,
      status: 'completed',
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});



const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  


