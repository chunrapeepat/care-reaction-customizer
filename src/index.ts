import ReactionBodyPNG from "./images/body.png";
import ReactionHandsPNG from "./images/hands.png";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Canvas context can't be null");
}

async function renderImage(imageSrc: string, width: number, height: number, offsetX: number, offsetY: number) {
    if (!ctx) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = function() {
        return ctx.drawImage(img, canvas.width / 2 - width / 2 + offsetX, canvas.width / 2 - height / 2 + offsetY, width, height);
    };
};

async function render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await renderImage(ReactionBodyPNG, 1024/2, 1024/2, 0, 0);
    await renderImage(ReactionHandsPNG, 1000/2, 480/2, 0, 90);
};

render(ctx);
