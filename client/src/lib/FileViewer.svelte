<script lang="ts">
  interface Props {
    filePath: string;
  }

  let { filePath }: Props = $props();

  const ext = $derived(filePath.split('.').pop()?.toLowerCase() ?? '');

  // Types that can be embedded in the browser
  const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif']);
  const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'mov']);
  const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a']);
  const PDF_EXTS = new Set(['pdf']);

  const isImage = $derived(IMAGE_EXTS.has(ext));
  const isVideo = $derived(VIDEO_EXTS.has(ext));
  const isAudio = $derived(AUDIO_EXTS.has(ext));
  const isPdf = $derived(PDF_EXTS.has(ext));
  const embeddable = $derived(isImage || isVideo || isAudio || isPdf);

  const fileUrl = $derived('/f/' + filePath);

  const fileName = $derived(filePath.split('/').pop() ?? filePath);
</script>

<div class="file-viewer">
  <div class="file-viewer-meta">
    <span class="file-viewer-path">{filePath}</span>
  </div>
  <div class="file-viewer-content">
    {#if isImage}
      <img src={fileUrl} alt={fileName} class="file-image" />
    {:else if isVideo}
      <video controls class="file-video">
        <source src={fileUrl} />
        <p>Your browser does not support video playback.</p>
      </video>
    {:else if isAudio}
      <audio controls class="file-audio">
        <source src={fileUrl} />
        <p>Your browser does not support audio playback.</p>
      </audio>
    {:else if isPdf}
      <iframe src={fileUrl} class="file-pdf" title={fileName}></iframe>
    {:else}
      <div class="file-unsupported">
        <p>This file type cannot be previewed.</p>
        <a href={fileUrl} target="_blank" rel="noopener" class="file-download-link">
          <i class="fas fa-download"></i> Download / Open
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .file-viewer {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .file-viewer-meta {
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-secondary);
  }

  .file-viewer-path {
    font-family: var(--font-mono);
    font-size: 12px;
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .file-viewer-content {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: auto;
  }

  .file-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .file-video {
    max-width: 100%;
    max-height: 80vh;
    border-radius: var(--radius);
    background: #000;
  }

  .file-audio {
    width: 100%;
    max-width: 500px;
    margin-top: 40px;
  }

  .file-pdf {
    width: 100%;
    height: 80vh;
    border: none;
    border-radius: var(--radius);
  }

  .file-unsupported {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }

  .file-unsupported p {
    margin-bottom: 16px;
    font-size: 15px;
  }

  .file-download-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
    transition: background 0.15s;
  }

  .file-download-link:hover {
    background: var(--bg-tertiary);
  }
</style>
