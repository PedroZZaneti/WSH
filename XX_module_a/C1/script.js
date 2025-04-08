document.addEventListener('DOMContentLoaded', () => {
    const folderInput = document.getElementById('folderInput');
    const compressBtn = document.getElementById('compressBtn');
    const folderName = document.getElementById('folderName');
    const status = document.getElementById('status');

    let selectedFolder = null;
    let folderFiles = [];

    folderInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            // Get the folder name from the first file's path
            const folderPath = files[0].webkitRelativePath;
            selectedFolder = folderPath.split('/')[0];
            folderName.textContent = `Selected folder: ${selectedFolder}`;
            compressBtn.disabled = false;
            
            // Store all files for processing
            folderFiles = Array.from(files);
        } else {
            selectedFolder = null;
            folderName.textContent = '';
            compressBtn.disabled = true;
        }
    });

    compressBtn.addEventListener('click', async () => {
        if (!selectedFolder || folderFiles.length === 0) {
            status.textContent = 'Please select a folder first.';
            return;
        }

        status.textContent = 'Processing...';
        compressBtn.disabled = true;

        try {
            const zip = new JSZip();
            
            // Process each file in the folder
            for (const file of folderFiles) {
                const relativePath = file.webkitRelativePath;
                const pathParts = relativePath.split('/');
                
                // Skip the folder name (first part) and build the internal path
                const internalPath = pathParts.slice(1).join('/');
                
                // Only add files (skip empty folders)
                if (internalPath) { // This ensures we're not adding the root folder itself
                    const fileContent = await readFileAsArrayBuffer(file);
                    zip.file(internalPath, fileContent);
                }
            }

            // Generate the ZIP file
            const content = await zip.generateAsync({ type: 'blob' });
            
            // Create download link
            const a = document.createElement('a');
            const url = URL.createObjectURL(content);
            a.href = url;
            a.download = `${selectedFolder}.zip`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                status.textContent = 'Download complete!';
                compressBtn.disabled = false;
            }, 100);
            
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
            compressBtn.disabled = false;
            console.error(error);
        }
    });

    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
});