const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
const drawButton = document.getElementById('draw-button');
const writeButton = document.getElementById('write-button');
const textBoxContainer = document.getElementById('text-box-container');
const userInput = document.getElementById('user-text');
const submitTextButton = document.getElementById('submit-text');
const photoButton = document.getElementById('photo-button');
const webcamContainer = document.getElementById('webcam-container');
const webcamVideo = document.getElementById('webcam');
const captureButton = document.getElementById('capture-button');

let photoElement = null;
let webcamStream = null;
let drawnElements = [];
let isTextFollowing = false;
let userText = '';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;

drawButton.addEventListener('click', () => {
    canvas.style.zIndex = 5;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
});

function startDrawing(event) {
    isDrawing = true;
    context.beginPath();
    context.moveTo(event.clientX, event.clientY);
}

function draw(event) {
    if (!isDrawing) return;
    context.lineTo(event.clientX, event.clientY);
    context.strokeStyle = '#333333'; 
    context.lineWidth = 3;
    context.stroke();

    context.lineWidth = 0.5; 
    context.strokeStyle = '#D3D3D3';
    context.stroke();
}

function stopDrawing() {
    isDrawing = false;
    context.closePath();
    drawnElements.push(context.getImageData(0, 0, canvas.width, canvas.height));
}

writeButton.addEventListener('click', () => {
    webcamContainer.style.display = 'none';
    textBoxContainer.style.display = 'flex';
});

submitTextButton.addEventListener('click', () => {
    userText = userInput.value;
    userInput.value = '';
    textBoxContainer.style.display = 'none';
    isTextFollowing = true;
});

function reDrawCanvas() {
    drawnElements.forEach((element) => {
        context.putImageData(element, 0, 0);
    });
}

canvas.addEventListener('mousemove', (event) => {
    if (isTextFollowing && userText) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        reDrawCanvas();
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.lineWidth = 2;
        context.strokeStyle = '#333333';
        context.strokeText(userText, mouseX, mouseY);
        context.fillText(userText, mouseX, mouseY);

        isTextFollowing = false;
    }
});

canvas.addEventListener('click', (event) => {
    if (isTextFollowing && userText) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        reDrawCanvas();
        context.fillStyle = 'black';
        context.font = '16px Arial';
        context.lineWidth = 2;
        context.strokeStyle = '#D3D3D3';
        context.strokeText(userText, mouseX, mouseY);
        context.fillText(userText, mouseX, mouseY);

        isTextFollowing = false;
    }
});

window.addEventListener('resize', () => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.putImageData(imageData, 0, 0);
});

photoButton.addEventListener('click', async () => {
    textBoxContainer.style.display = 'none';
    webcamContainer.style.display = 'block';

    if (!webcamStream) {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamVideo.srcObject = webcamStream;
        } catch (error) {
            alert('웹캠을 사용할 수 없습니다.');
        }
    }
});

captureButton.addEventListener('click', () => {
    const canvasCapture = document.createElement('canvas');
    canvasCapture.width = 200;
    canvasCapture.height = 150;
    const captureContext = canvasCapture.getContext('2d');
    
    captureContext.save();
    captureContext.scale(-1, 1);
    captureContext.drawImage(webcamVideo, -200, 0, 200, 150);
    captureContext.restore();

    photoElement = document.createElement('img');
    photoElement.src = canvasCapture.toDataURL();
    photoElement.classList.add('photo-element');
    document.body.appendChild(photoElement);

    webcamContainer.style.display = 'none';
    webcamStream.getTracks().forEach(track => track.stop());

    photoElement.style.position = 'absolute';
    photoElement.style.top = `${event.clientY}px`;
    photoElement.style.left = `${event.clientX}px`;
    photoElement.style.pointerEvents = 'none';
});

document.addEventListener('mousemove', (event) => {
    if (photoElement) {
        photoElement.style.top = `${event.clientY}px`;
        photoElement.style.left = `${event.clientX}px`;
    }
});

document.addEventListener('click', (event) => {
    if (photoElement) {
        photoElement.style.top = `${event.clientY}px`;
        photoElement.style.left = `${event.clientX}px`;
        photoElement.style.pointerEvents = 'auto';
        photoElement = null;
    }
});
