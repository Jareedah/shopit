/**
 * Image Upload Module
 * Handles file selection, validation, and preview functionality
 */

const ImageUpload = (function() {
    let uploadedFiles = [];
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    return {
        // Handle file selection
        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            
            // Check if adding these files would exceed the limit
            if (uploadedFiles.length + files.length > MAX_FILES) {
                throw new Error(`You can only upload up to ${MAX_FILES} images`);
            }
            
            files.forEach(file => {
                // Validate file
                if (!this.validateFile(file)) {
                    throw new Error(`Invalid file: ${file.name}`);
                }
                
                // Add to uploaded files
                uploadedFiles.push(file);
                
                // Create preview
                this.createPreview(file);
            });
            
            // Clear the input
            event.target.value = '';
        },
        
        // Validate file
        validateFile(file) {
            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                return false;
            }
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                return false;
            }
            
            return true;
        },
        
        // Create image preview
        createPreview(file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewContainer = document.getElementById('imagePreview');
                
                // Remove empty state if it exists
                const emptyState = previewContainer.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = () => this.removeImage(file, previewItem);
                
                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                previewContainer.appendChild(previewItem);
            }.bind(this);
            
            reader.readAsDataURL(file);
        },
        
        // Remove image from preview and uploaded files
        removeImage(file, previewElement) {
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            previewElement.remove();
            
            // Show empty state if no images left
            const previewContainer = document.getElementById('imagePreview');
            if (uploadedFiles.length === 0) {
                const emptyState = document.createElement('p');
                emptyState.className = 'empty-state';
                emptyState.textContent = 'No images added yet';
                previewContainer.appendChild(emptyState);
            }
        },
        
        // Add captured image from camera
        addCapturedImage(file) {
            if (uploadedFiles.length >= MAX_FILES) {
                throw new Error(`You can only upload up to ${MAX_FILES} images`);
            }
            
            if (!this.validateFile(file)) {
                throw new Error(`Invalid captured image`);
            }
            
            uploadedFiles.push(file);
            this.createPreview(file);
        },
        
        // Get all uploaded files
        getFiles() {
            return uploadedFiles;
        },
        
        // Clear all uploaded files
        clearFiles() {
            uploadedFiles = [];
            const previewContainer = document.getElementById('imagePreview');
            previewContainer.innerHTML = '<p class="empty-state">No images added yet</p>';
        },
        
        // Get the number of uploaded files
        getFileCount() {
            return uploadedFiles.length;
        }
    };
})();