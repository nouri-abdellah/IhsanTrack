const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذر معالجة الصورة"));
    image.src = dataUrl;
  });

export async function fileToDataUrl(file, options = {}) {
  if (!file) return "";

  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    outputType = "image/jpeg",
  } = options;

  // Keep non-image files as-is.
  if (!file.type?.startsWith("image/")) {
    return readAsDataUrl(file);
  }

  const originalDataUrl = await readAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const widthRatio = maxWidth / image.width;
  const heightRatio = maxHeight / image.height;
  const ratio = Math.min(1, widthRatio, heightRatio);

  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return originalDataUrl;
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const compressed = canvas.toDataURL(outputType, quality);
  return compressed.length < originalDataUrl.length ? compressed : originalDataUrl;
}