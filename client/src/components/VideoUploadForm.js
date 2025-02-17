import React, { useState, useEffect } from 'react';
import styles from './VideoUploadForm.module.css';
import { FaBars, FaTimes, FaHistory, FaUser, FaMagic } from 'react-icons/fa';
import { useUser } from "@clerk/clerk-react";

function VideoUploadForm() {
  const [prompt, setPrompt] = useState('');
  const [numInferenceSteps, setNumInferenceSteps] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [numFrames, setNumFrames] = useState(129);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [transformedVideoUrl, setTransformedVideoUrl] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, isSignedIn } = useUser();
  const [transformationHistory, setTransformationHistory] = useState([]);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserHistory();
    }
  }, [isSignedIn]);

  const fetchUserHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/history/${user.id}`);//3005
      if (response.ok) {
        const data = await response.json();
        setTransformationHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
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
      userId: user.id,
      userEmail: user.primaryEmailAddress.emailAddress
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/transform`, {
      // const response = await fetch(`http://localhost:3001/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Video transformation failed');
      }

      const result = await response.json();

      console.log(result);
      console.log(result.result.video.url);
      if (result.result && result.result.video.url) {
        setTransformedVideoUrl(result.result.video.url);
        fetchUserHistory();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setPrompt(item.parameters.prompt);
    setNumInferenceSteps(item.parameters.num_inference_steps || 30);
    setAspectRatio(item.parameters.aspect_ratio || '16:9');
    setResolution(item.parameters.resolution || '720p');
    setNumFrames(item.parameters.num_frames || 129);
    setTransformedVideoUrl(item.transformedUrl || '');
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
          Enter a prompt and click Transform to begin
        </div>
      </div>
    );
  };

  const renderHistoryItems = () => {
    if (!transformationHistory.length) {
      return <div className={styles.historyItem}>No transformations yet</div>;
    }

    return transformationHistory.map((item, index) => (
      <div 
        key={index} 
        className={styles.historyItem}
        onClick={() => handleHistoryItemClick(item)}
      >
        <p className={styles.historyPrompt}>{item.parameters.prompt}</p>
        <small className={styles.historyDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </small>
        <div className={styles.historyThumbnail}>
          <video 
            src={item.transformedUrl} 
            width="100" 
            controls
          ></video>
        </div>
      </div>
    ));
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
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className={styles.userImage} />
              ) : (
                <FaUser size={40} />
              )}
            </div>
            <h3>{user?.fullName || 'Guest User'}</h3>
          </div>
          
          <div className={styles.historySection}>
            <h4><FaHistory /> History</h4>
            {isSignedIn ? (
              renderHistoryItems()
            ) : (
              <div className={styles.historyItem}>
                Please sign in to view history
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <h2 className={styles.mainTitle}>AI Video Transformation Studio</h2>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left Section - Form */}
          <div className={styles.formSection}>
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Aspect Ratio:</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className={styles.select}
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
                  />
                  Enable Safety Checker
                </label>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
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
