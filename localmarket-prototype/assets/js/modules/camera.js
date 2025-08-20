/**
 * Camera Service Module
 * Handles camera access and photo capture functionality
 */

const CameraService = (function() {
    let stream = null;
    let videoElement = null;
    let canvasElement = null;
    
    return {
        // Initialize camera
        async initCamera() {
            try {
                videoElement = document.getElementById('cameraFeed');
                canvasElement = document.getElementById('photoCanvas');
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }, 
                    audio: false 
                });
                
                videoElement.srcObject = stream;
                return true;
            } catch (error) {
                console.error('Camera initialization error:', error);
                throw new Error('Unable to access camera: ' + error.message);
            }
        },
        
        // Capture photo from camera
        capturePhoto() {
            if (!videoElement || !canvasElement) {
                throw new Error('Camera not initialized');
            }
            
            const context = canvasElement.getContext('2d');
            
            // Set canvas dimensions to match video
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            
            // Draw current video frame to canvas
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            
            // Convert canvas to blob
            return new Promise((resolve) => {
                canvasElement.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            });
        },
        
        // Stop camera stream
        stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            
            if (videoElement) {
                videoElement.srcObject = null;
            }
        },
        
        // Check if camera is available
        isCameraAvailable() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        }
    };
})();