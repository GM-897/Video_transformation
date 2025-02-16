
require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const cors = require('cors');
// const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const { fal } = require("@fal-ai/client");
const User = require('./models/User');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');


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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  async function findOrCreateFromClerk(userData) {
    try {
        let user = await User.findOne({ clerkId: userData.id });
        if (!user) {
            user = await User.create({
                clerkId: userData.id,
                email: userData.emailAddresses[0].emailAddress, 
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl
            });
        }
        return user;
    } catch (error) {
        console.error("Error in findOrCreateFromClerk:", error);
        throw error;
    }
}

// app.use('/api/auth', authRoutes);
const requireAuth = ClerkExpressRequireAuth({});

// Route to create/update user in MongoDB after Clerk authentication
app.post('/sync-user', requireAuth, async (req, res) => {
  try {
      const clerkUserId = req.auth.userId;
      const email = req.auth.claims.email;
      const firstName = req.auth.claims.firstName;
      const lastName = req.auth.claims.lastName;
      const profileImageUrl = req.auth.claims.picture;

      const user = await findOrCreateFromClerk({
          id: clerkUserId,
          emailAddresses: [{ emailAddress: email }],
          firstName,
          lastName,
          profileImageUrl
      });

      res.json({ success: true, user });
  } catch (error) {
      console.error('Error syncing user:', error);
      res.status(500).json({ success: false, error: 'Failed to sync user' });
  }
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
    console.log("here")
    
    try {
        const {
            prompt,
            num_inference_steps,
            aspect_ratio,
            resolution,
            num_frames,
            enable_safety_checker,
            video_url,
            strength
        } = req.body;
        
    console.log("here")
    console.log(req.body)
    // const result = await fal.subscribe("fal-ai/hunyuan-video/video-to-video", {
    const { request_id } = await fal.queue.submit("fal-ai/hunyuan-video/video-to-video", {
        
        input: {
          prompt,
          num_inference_steps,
          aspect_ratio,
          resolution,
          num_frames,
          enable_safety_checker,
          video_url,
          strength
},
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log(update.logs.map((log) => log.message));
          }
        },
      });
      console.log("status request")
      console.log(request_id)

      let status = await fal.queue.status("fal-ai/hunyuan-video/video-to-video", {
        requestId: request_id,
        logs: true,
      });
      
      console.log(status)
    // await new Promise((resolve) => setTimeout(resolve, 60000));
    while (status.status === "IN_PROGRESS" || status.status === "IN_QUEUE") {
      console.log("Waiting for the transformation to complete...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      status = await fal.queue.status("fal-ai/hunyuan-video/video-to-video", {
        requestId: request_id,
        logs: true,
      });
    }

      const result = await fal.queue.result("fal-ai/hunyuan-video/video-to-video", {
        requestId: request_id
      });

      console.log("result is here")
      console.log(result.data);
  
      res.json({
        message: 'Video transformation completed',
        result: result.data,
        requestId: result.requestId
      });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Video transformation failed' });
    }
  });

  
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  


