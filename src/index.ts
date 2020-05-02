import ReactionBodyPNG from "./images/body.png";
import ReactionHandsPNG from "./images/hands.png";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Canvas context can't be null");
}

let uploadedImage: string | undefined = undefined;
let uploadedWidth: number | undefined = undefined;
let uploadedHeight: number | undefined = undefined;
let offsetX = 0;
let offsetY = 0;
let degree = 0;
let scale = 1;

// event handlers
const uploader = document.getElementById('uploader');
if (!uploader) {
    throw new Error("Uploader can't be null");
}
uploader.addEventListener('change', handleUpload, false);
function handleUpload(e: any) {
    const reader = new FileReader();
    reader.onload = function(event){
        if (!ctx) return;

        render(ctx,  () => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                if (!event.target) {
                    reject();
                    return;
                }
                img.onload = async function() {
                    if (!event.target) return;
                    await renderImage(event.target.result, img.width / 2, img.height / 2, 0, 0, 0);
                    uploadedImage = event.target.result;
                    uploadedWidth = img.width / 2;
                    uploadedHeight = img.height / 2;
                    resolve();
                };
                img.src = event.target.result;
            });
        });
    };
    reader.readAsDataURL(e.target.files[0]);
}

const sliderX = document.getElementById('range-x');
if (!sliderX) {
    throw new Error("Slider X can't be null");
}
sliderX.addEventListener('input', handleRangeX, false);
function handleRangeX(e: any) {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    offsetX = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, reject) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree);
            resolve();
        });
    });
}

const sliderY = document.getElementById('range-y');
if (!sliderY) {
    throw new Error("Slider Y can't be null");
}
sliderY.addEventListener('input', handleRangeY, false);
function handleRangeY(e: any) {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    offsetY = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, reject) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree);
            resolve();
        });
    });
}

const rotate = document.getElementById('rotate');
if (!rotate) {
    throw new Error("Rotate can't be null");
}
rotate.addEventListener('input', handleRotate, false);
function handleRotate(e: any) {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    degree = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, reject) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree);
            resolve();
        });
    });
}

const scalePanel = document.getElementById('scale');
if (!scalePanel) {
    throw new Error("Scale can't be null");
}
scalePanel.addEventListener('input', handleScale, false);
function handleScale(e: any) {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    scale = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, reject) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree);
            resolve();
        });
    });
}

// canvas functions
function download() {
    const download = document.getElementById("download");
    const image = canvas.toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    if (!download) return;
    download.setAttribute("href", image);

    // upload file to firebase storage
    // @ts-ignore
    canvas.toBlob(function(blob){
        var image = new Image();
        image.src = blob;

        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime = date+'--'+time+'--'+today.getTime();

        firebase.storage().ref().child(`images/${dateTime}.png`).put(blob);
    });
}
// @ts-ignore
window.download = download;

const memo: {[key: string]: HTMLImageElement} = {};
function renderImage(imageSrc: string, width: number, height: number, offsetX: number, offsetY: number, degree: number) {
    return new Promise((resolve, reject) => {
        if (!ctx) {
            reject();
            return;
        }
        if (memo[imageSrc]) {
            const img = memo[imageSrc];
            ctx.save();
            if (degree !== 0) {
                ctx.translate(width/2 + offsetX, height/2 - offsetY);
                ctx.rotate(degree * Math.PI / 360);
                ctx.drawImage(img, -(canvas.width / 2 - width / 2), -(canvas.width / 2 - height / 2), width, height);
            } else {
                ctx.drawImage(img, (canvas.width / 2 - width / 2) + offsetX, (canvas.width / 2 - height / 2) + offsetY, width, height);
            }
            ctx.restore();
            resolve(img);
        } else {
            const img = new Image();
            img.onload = function() {
                ctx.save();
                if (degree !== 0) {
                    ctx.translate(width/2 + offsetX, height/2 - offsetY);
                    ctx.rotate(degree * Math.PI / 360);
                    ctx.drawImage(img, -(canvas.width / 2 - width / 2), -(canvas.width / 2 - height / 2), width, height);
                } else {
                    ctx.drawImage(img, (canvas.width / 2 - width / 2) + offsetX, (canvas.width / 2 - height / 2) + offsetY, width, height);
                }
                ctx.restore();
                memo[imageSrc] = img;
                resolve(img);
            };
            img.src = imageSrc;
        }
    });
};

async function render(ctx: CanvasRenderingContext2D, fn: VoidFunction | null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await renderImage(ReactionBodyPNG, 1024/2, 1024/2, 0, 0, 0);
    if (fn) await fn();
    await renderImage(ReactionHandsPNG, 1000/2, 480/2, 0, 90, 0);

    // ctx.fillStyle = "#ddd";
    // ctx.font = "35px Arial";
    // ctx.fillText("https://care-reaction-customizer.thechun.dev", 30, 50);
};

// init parameters
render(ctx, null);
