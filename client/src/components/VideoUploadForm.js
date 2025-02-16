import React, { useState } from 'react';
import { Widget } from "@uploadcare/react-widget";
import styles from './VideoUploadForm.module.css';
import { FaBars, FaTimes, FaHistory, FaUser, FaMagic, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { useAuthContext } from '../context/AuthContext';

function VideoUploadForm() {
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [numInferenceSteps, setNumInferenceSteps] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [numFrames, setNumFrames] = useState(129);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [transformedVideoUrl, setTransformedVideoUrl] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const resetForm = () => {
    setVideoUrl('');
    setPrompt('');
    setNumInferenceSteps(0);
    setAspectRatio('default');
    setResolution('default');
    setNumFrames('default');
    setEnableSafetyChecker(true);
    setIsVideoSelected(false);
    setTransformedVideoUrl('');
  };
  const {user} = useAuthContext();
  
  const handleUpload = (fileInfo) => {
    if (!fileInfo) {
      resetForm();
      return;
    }
    
    const videoUrl = fileInfo.cdnUrl;
    setVideoUrl(videoUrl);
    setIsVideoSelected(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

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
    } finally {
      setIsProcessing(false);
    }

  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const getRightSideContent = () => {
    if (isProcessing) {
      return (
        <div className={styles.placeholderContent}>
          <div className={styles.processingAnimation}>
            <FaMagic className={styles.spinningWand} />
          </div>
          <div className={styles.watermark}>Processing...</div>
        </div>
      );
    }

    if (transformedVideoUrl) {
      return (
        <div className={styles.transformedVideo}>
          <h3>Transformed Video</h3>
          <video controls src={transformedVideoUrl} width="400" className={styles.videoPreview}></video>
        </div>
      );
    }

    return (
      <div className={styles.placeholderContent}>
        <FaMagic className={styles.magicWand} />
        <div className={styles.watermark}>
          {videoUrl ? 'Click Transform to Begin' : 'Upload Video to Get Started'}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${!isSidebarOpen ? styles.collapsed : ''}`}>
        <button 
          className={styles.sidebarToggle}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className={styles.sidebarContent}>
          <div className={styles.profileSection}>
            <div className={styles.profilePic}>
              <img 
                src={user?.profileImageUrl} 
                alt={user?.firstName || 'Profile'} 
                className={styles.profileImage}
              />
            </div>
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p className={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</p>
            <button 
              onClick={handleSignOut} 
              className={styles.logoutButton}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
          
          <div className={styles.historySection}>
            <h4><FaHistory /> History</h4>
            {/* Add history items here */}
            <div className={styles.historyItem}>
              Previous Transformations...
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <h2 className={styles.mainTitle}>AI Video Transformation Studio</h2>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left Section - Form */}
          <div className={styles.formSection}>
            <div className={styles.uploadSection}>
              <Widget
                className={styles.uploadWidget}
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
                <div className={styles.uploadedVideo}>
                  <h3>Uploaded Video</h3>
                  <video 
                    controls 
                    src={videoUrl} 
                    width="400" 
                    className={styles.videoPreview}
                  ></video>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Prompt:</label>
                <input 
                  type="text" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  required 
                  placeholder="Describe how you want to transform the video..."
                  className={styles.input}
                  disabled={!isVideoSelected}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Inference Steps: {numInferenceSteps}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="30" 
                    value={numInferenceSteps} 
                    onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
                    className={styles.slider}
                    disabled={!isVideoSelected}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Aspect Ratio:</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className={styles.select}
                    disabled={!isVideoSelected}
                  >
                    <option value="default">Default</option>
                    <option value="9:16">9:16</option>
                    <option value="16:9">16:9</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Resolution:</label>
                  <select 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value)}
                    className={styles.select}
                    disabled={!isVideoSelected}
                  >
                    <option value="default">Default</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Number of Frames:</label>
                  <select 
                    value={numFrames} 
                    onChange={(e) => setNumFrames(Number(e.target.value))}
                    className={styles.select}
                    disabled={!isVideoSelected}
                  >
                    <option value="85">85</option>
                    <option value="129">129</option>
                    <option value="default">Default</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={enableSafetyChecker} 
                    onChange={(e) => setEnableSafetyChecker(e.target.checked)}
                    className={styles.checkbox}
                    disabled={!isVideoSelected}
                  />
                  Enable Safety Checker
                </label>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={!isVideoSelected}
              >
                Transform Video
              </button>
            </form>
          </div>

          {/* Right Section - Results */}
          <div className={styles.resultSection}>
            {getRightSideContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoUploadForm;
