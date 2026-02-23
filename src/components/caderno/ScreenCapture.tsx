import { useCallback } from "react";
import { toast } from "sonner";

export function useScreenCapture(onInsertImage: (src: string) => void) {
  const captureScreen = useCallback(async () => {
    try {
      // Use the browser's built-in screen capture API
      const canvas = document.createElement('canvas');
      const video = document.createElement('video');

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'window' } as any,
      });

      video.srcObject = stream;
      await video.play();

      // Wait a frame for video to render
      await new Promise(r => setTimeout(r, 100));

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(t => t.stop());
      video.srcObject = null;

      const dataUrl = canvas.toDataURL('image/png');
      onInsertImage(dataUrl);
      toast.success('Captura de tela inserida!');
    } catch (e: any) {
      if (e.name !== 'NotAllowedError') {
        toast.error('Erro ao capturar tela: ' + e.message);
      }
    }
  }, [onInsertImage]);

  return { captureScreen };
}
