document.addEventListener('DOMContentLoaded', function() {
    const originalImage = document.getElementById('originalImage');
    const imageUpload = document.getElementById('imageUpload');
    const generateBtn = document.getElementById('generateBtn');
    const cellSizeInput = document.getElementById('cellSize');
    
    // Disable generate button initially
    generateBtn.disabled = true;
    
    // Get URL parameters for initial cell size
    const urlParams = new URLSearchParams(window.location.search);
    let cellSize = urlParams.get('cell_size');
    
    // Set default cell size if not provided or invalid
    if (!cellSize || isNaN(cellSize) || cellSize < 1) {
        cellSize = 50;
    } else {
        cellSize = parseInt(cellSize);
        cellSizeInput.value = cellSize;
    }
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                originalImage.src = event.target.result;
                originalImage.style.display = 'block';
                generateBtn.disabled = false;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Handle mosaic generation
    generateBtn.addEventListener('click', function() {
        if (!originalImage.src || originalImage.src === '#') {
            alert('Please upload an image first');
            return;
        }
        
        const newCellSize = parseInt(cellSizeInput.value);
        if (!isNaN(newCellSize) && newCellSize > 0) {
            generateMosaic(newCellSize);
        } else {
            alert('Please enter a valid cell size (positive number)');
        }
    });
    
    // Generate mosaic function
    function generateMosaic(cellSize) {
        const canvas = document.getElementById('mosaicImage');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match original image
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate number of cells in each dimension
        const cellsX = Math.ceil(canvas.width / cellSize);
        const cellsY = Math.ceil(canvas.height / cellSize);
        
        // Create off-screen canvas for processing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = originalImage.naturalWidth;
        tempCanvas.height = originalImage.naturalHeight;
        tempCtx.drawImage(originalImage, 0, 0);
        
        // Process each cell
        for (let y = 0; y < cellsY; y++) {
            for (let x = 0; x < cellsX; x++) {
                // Calculate cell boundaries
                const startX = x * cellSize;
                const startY = y * cellSize;
                const endX = Math.min(startX + cellSize, canvas.width);
                const endY = Math.min(startY + cellSize, canvas.height);
                const width = endX - startX;
                const height = endY - startY;
                
                // Get image data for this cell
                const imageData = tempCtx.getImageData(startX, startY, width, height);
                const data = imageData.data;
                
                // Calculate average color
                let r = 0, g = 0, b = 0, a = 0;
                let pixelCount = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    a += data[i + 3];
                    pixelCount++;
                }
                
                r = Math.round(r / pixelCount);
                g = Math.round(g / pixelCount);
                b = Math.round(b / pixelCount);
                a = Math.round(a / pixelCount);
                
                // Draw the cell with average color
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                ctx.fillRect(startX, startY, width, height);
            }
        }
    }
});