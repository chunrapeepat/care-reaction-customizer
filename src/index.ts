import ReactionBodyPNG from "./images/body.png";
import ReactionHandsPNG from "./images/hands.png";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Canvas context can't be null");
}

function renderImage(imageSrc: string, width: number, height: number, offsetX: number, offsetY: number) {
    return new Promise((resolve, reject) => {
        if (!ctx) {
            reject();
            return;
        }
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, canvas.width / 2 - width / 2 + offsetX, canvas.width / 2 - height / 2 + offsetY, width, height);
            resolve();
        };
        img.src = imageSrc;
    });
};

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
                    await renderImage(event.target.result, img.width / 2, img.height / 2, 0, 0);

                    resolve();
                };
                img.src = event.target.result;
            });
        });
    };
    reader.readAsDataURL(e.target.files[0]);
}

async function render(ctx: CanvasRenderingContext2D, fn) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await renderImage(ReactionBodyPNG, 1024/2, 1024/2, 0, 0);

    if (fn) await fn();

    await renderImage(ReactionHandsPNG, 1000/2, 480/2, 0, 90);
};

render(ctx, null);
