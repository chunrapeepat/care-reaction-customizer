import ReactionBodyPNG from "./images/body.png";
import ReactionHandsPNG from "./images/hands.png";

const canvas = document.getElementById("renderer") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Canvas context can't be null");
}

function renderImage(imageSrc: string, width: number, height: number, offsetX: number, offsetY: number) {
    if (!ctx) return;
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, canvas.width / 2 - width / 2 + offsetX, canvas.width / 2 - height / 2 + offsetY, width, height);
    };
    img.src = imageSrc;
}

renderImage(ReactionBodyPNG, 1024/2, 1024/2, 0, 0);
renderImage(ReactionHandsPNG, 1000/2, 480/2, 0, 90);

ctx.fillStyle = "#fafafa";
ctx.fillRect(0, 0, canvas.width, canvas.height);
