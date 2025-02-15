import React, { useState } from 'react';
import { Widget } from "@uploadcare/react-widget";
// import { fal } from "@fal-ai/client";

function VideoUploadForm() {
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [numInferenceSteps, setNumInferenceSteps] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [numFrames, setNumFrames] = useState(129);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [transformedVideoUrl, setTransformedVideoUrl] = useState('');


  const handleUpload = async (fileInfo) => {
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadcareUrl: fileInfo.cdnUrl }),
      });

      if (!response.ok) {
        throw new Error('Upload to Cloudinary failed');
      }

      const data = await response.json();
      setVideoUrl(data.cloudinaryUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      prompt,
      num_inference_steps: numInferenceSteps,
      aspect_ratio: aspectRatio,
      resolution,
      num_frames: numFrames,
      enable_safety_checker: enableSafetyChecker,
      video_url: videoUrl,
      strength: 0.85
    };
    console.dir(requestData, { depth: null });
    try {
      const response = await fetch('http://localhost:3001/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Video transformation failed');
      }
      console.log(response);

      const result = await response.json();
      if (result.result && result.result.video_url) {
        setTransformedVideoUrl(result.result.video.url);
      }      
      // Handle the result (e.g., display the transformed video URL)
    } catch (error) {
      console.error('Error:', error);
    }

  };

  return (
    <div>
      <h2>Upload and Transform Video</h2>
      <Widget
        publicKey={process.env.REACT_APP_UPLOADCARE_PUBLIC_KEY}
        onChange={handleUpload}
        clearable
        imagesOnly={false}
        validators={[
          file => file.size <= 100 * 1024 * 1024,
          file => ['video/mp4', 'video/quicktime'].includes(file.mimeType),
        ]}
      />
      {videoUrl && (
        <div>
          <h3>Uploaded Video URL:</h3>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Prompt:</label>
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
        </div>
        <div>
          <label>Number of Inference Steps:</label>
          <input type="range" min="0" max="30" value={numInferenceSteps} onChange={(e) => setNumInferenceSteps(Number(e.target.value))} />
          <span>{numInferenceSteps}</span>
        </div>
        <div>
          <label>Aspect Ratio:</label>
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="default">Default</option>
            <option value="9:16">9:16</option>
            <option value="16:9">16:9</option>
          </select>
        </div>
        <div>
          <label>Resolution:</label>
          <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="default">Default</option>
            <option value="480p">480p</option>
            <option value="720p">720p</option>
          </select>
        </div>
        <div>
          <label>Number of Frames:</label>
          <select value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))}>
            <option value="85">85</option>
            <option value="129">129</option>
            <option value="default">Default</option>
          </select>
        </div>
        <div>
          <label>Enable Safety Checker:</label>
          <input type="checkbox" checked={enableSafetyChecker} onChange={(e) => setEnableSafetyChecker(e.target.checked)} />
        </div>
        <button type="submit">Transform Video</button>
      </form>

      {transformedVideoUrl && (
  <div>
    <h3>Transformed Video:</h3>
    <video controls src={transformedVideoUrl} width="400"></video>
  </div>
)}

    </div>
  );
}

export default VideoUploadForm;
