import React, { useState } from 'react';
import axios from 'axios';
import './promptToImage.css';

const PromptToImage = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3005/transform', {
                prompt: prompt
            });
            console.log('Response:', response.data); 
            // Debug log
            if (response.data && response.data.imageUrl) {
                setGeneratedImage(response.data.imageUrl);
                console.log("hellow world" ,generatedImage)
            } else {
                setError('No image URL received from the server');
            }
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="prompt-to-image-container">
            <div className="input-section">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="prompt">Enter your prompt:</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to generate..."
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading || !prompt.trim()}
                    >
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="output-section">
                {isLoading && <div className="loading">Generating image...</div>}
                {generatedImage && !isLoading && (
                    <div className="image-container">
                        <img 
                            src={generatedImage} 
                            alt="Generated artwork" 
                            onError={(e) => {
                                console.error('Image failed to load:', generatedImage);
                                setError('Failed to load the generated image');
                            }}
                        />
                        <div className="image-url">
                            <p>Image URL:</p>
                            <code>{generatedImage}</code>
                        </div>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default PromptToImage;
