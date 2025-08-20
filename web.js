const fileInput = document.getElementById('fileInput');
const removeButton = document.getElementById('removeButton');
const downloadButton = document.getElementById('downloadButton');
const originalImageContainer = document.getElementById('originalImageContainer');
const processedImageContainer = document.getElementById('processedImageContainer');
const originalPlaceholder = document.getElementById('originalPlaceholder');
const processedPlaceholder = document.getElementById('processedPlaceholder');
const loadingIndicator = document.getElementById('loadingIndicator');
const statusMessage = document.getElementById('statusMessage');
let uploadedFile = null;
let processedImageUrl = null;

function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? 'rgb(248 113 113)' : 'rgb(96 165 250)';
}

// Event listener for when a file is selected
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        showStatus('');
        originalPlaceholder.classList.add('hidden');
        processedPlaceholder.classList.add('hidden');
        processedImageContainer.innerHTML = '';
        originalImageContainer.innerHTML = '';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Original Image';
            img.className = 'w-auto h-full max-w-full rounded-md object-contain transition-transform duration-300 hover:scale-105';
            originalImageContainer.appendChild(img);
            removeButton.disabled = false;
            downloadButton.disabled = true;
            processedImageUrl = null;
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for the "Remove Background" button
removeButton.addEventListener('click', async () => {
    if (!uploadedFile) {
        showStatus('Please select an image first.', true);
        return;
    }

    removeButton.disabled = true;
    fileInput.disabled = true;
    downloadButton.disabled = true;
    loadingIndicator.classList.remove('hidden');
    showStatus('Removing background...', false);
    processedImageContainer.innerHTML = '';

    const apiKey = 'CpK5WYGjqHHdP47V2gPAL1oK'; // Your actual remove.bg API key

    // This is the line that was incorrect. The code would always run the error block.
    // The corrected line now only checks if the API key is empty.
    if (!apiKey) {
        showStatus('API key is missing. Please configure it in the code.', true);
        loadingIndicator.classList.add('hidden');
        removeButton.disabled = false;
        fileInput.disabled = false;
        return;
    }

    try {
        const formData = new FormData();
        formData.append('image_file', uploadedFile);
        formData.append('size', 'auto');
        formData.append('output_format', 'png');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error removing background: ${errorData.errors[0].title}`);
        }

        const blob = await response.blob();
        processedImageUrl = URL.createObjectURL(blob);
        const processedImg = document.createElement('img');
        processedImg.src = processedImageUrl;
        processedImg.alt = 'Processed Image';
        processedImg.className = 'w-auto h-full max-w-full rounded-md object-contain transition-transform duration-300 hover:scale-105';
        processedImageContainer.appendChild(processedImg);

        downloadButton.disabled = false;
        showStatus('Background removed successfully!', false);
    } catch (error) {
        console.error('Fetch error:', error);
        showStatus(error.message, true);
    } finally {
        loadingIndicator.classList.add('hidden');
        removeButton.disabled = false;
        fileInput.disabled = false;
    }
});

// Event listener for the "Download" button
downloadButton.addEventListener('click', () => {
    if (processedImageUrl) {
        const link = document.createElement('a');
        link.href = processedImageUrl;
        link.download = 'transparent-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});