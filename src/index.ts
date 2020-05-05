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
let flip: [number, number] = [ 1, 1 ];

// event handlers
function handleInput(id: string, eventName: string, handler: (e: any) => void) {
    const elem = document.getElementById(id);
    if (!elem) {
        throw new Error(`${id} must be existed`);
    }
    elem.addEventListener(eventName, handler, false);
}

// register uploader input
handleInput("uploader", "change", (e: any) => {
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
});

// handle controller-inputs
function isUserUploaded() {
    return uploadedImage && uploadedWidth !== undefined && uploadedHeight !== undefined && ctx;
}
handleInput("x-offset-input", "input", (e: any) => {
    if (!isUserUploaded()) return;

    offsetX = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, _) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree, flip);
            resolve();
        });
    });
});
handleInput("y-offset-input", "input", (e: any) => {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    offsetY = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, _) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree, flip);
            resolve();
        });
    });
});
handleInput("rotate-input", "input", (e: any) => {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    degree = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, _) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree, flip);
            resolve();
        });
    });
});
handleInput("scale-input", "input", (e: any) => {
    if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
    if (!ctx) return;

    scale = +e.target.value;

    render(ctx,  () => {
        return new Promise(async (resolve, _) => {
            if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
            await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree, flip);
            resolve();
        });
    });
});

function flipImage (flipIndex: number): (e: any) => void {
    return (e: any) => {
        if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
        if (!ctx) return;
    
        flip[flipIndex] *= -1;
        
        render(ctx, () => {
            return new Promise(async (resolve, _) => {
                if (!uploadedImage || !uploadedHeight || !uploadedWidth) return;
                await renderImage(uploadedImage, uploadedWidth * scale, uploadedHeight * scale, offsetX, offsetY, degree, flip);
                resolve();
            });
        });        
    };
};

handleInput("flip-horizontal-btn", "click", flipImage(0));
handleInput("flip-vertical-btn",   "click", flipImage(1));

function download() {
    const download = document.getElementById("download");
    const image = canvas.toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    if (!download) return;
    download.setAttribute("href", image);

    // store file in firebase storage
    if (uploadedImage) {
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
}
// @ts-ignore
window.download = download;

function drawImage(img: HTMLImageElement, width: number, height: number, offsetX: number, offsetY: number, degree: number, flip: [number, number]): void {
    if (!ctx) return;

    ctx.save();
    ctx.translate(width/2 + offsetX + (canvas.width / 2 - width / 2), height/2 - offsetY + (canvas.width / 2 - height / 2));
    ctx.rotate(degree * Math.PI / 360);
    ctx.scale(flip[0], flip[1]);
    ctx.drawImage(img, -(width/2), -(height/2), width, height);
    ctx.restore();
}

const memo: {[key: string]: HTMLImageElement} = {};
function renderImage(imageSrc: string, width: number, height: number, offsetX: number, offsetY: number, degree: number, flip: [number, number] = [1, 1]) {
    return new Promise((resolve, reject) => {
        if (!ctx) {
            reject();
            return;
        }
        if (memo[imageSrc]) {
            drawImage(memo[imageSrc], width, height, offsetX, offsetY, degree, flip);
            resolve(memo[imageSrc]);
        } else {
            const img = new Image();
            img.onload = function() {
                drawImage(img, width, height, offsetX, offsetY, degree, flip);

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
    await renderImage(ReactionHandsPNG, 1000/2, 480/2, 0, -90, 0);
};

render(ctx, null);
