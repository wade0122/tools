// ==UserScript==
// @name         Safari Video Downloader
// @namespace    https://greasyfork.org/users/your-username
// @version      1.5
// @description  Detect playing videos and show a download button for HLS (m3u8) videos in Safari, download and merge segments automatically
// @author       YourName
// @match        *://*/*
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let videoList = [];
    let downloadButton;

    function detectVideos() {
        videoList = [];
        document.querySelectorAll('video, source').forEach(element => {
            if (element.src && !videoList.includes(element.src)) {
                videoList.push(element.src);
            }
        });
    }

    function showDownloadButton() {
        if (!downloadButton) {
            downloadButton = document.createElement('button');
            downloadButton.innerText = 'Download Video';
            downloadButton.style.position = 'fixed';
            downloadButton.style.top = '10px';
            downloadButton.style.right = '10px';
            downloadButton.style.zIndex = '10000';
            downloadButton.style.padding = '10px';
            downloadButton.style.backgroundColor = 'red';
            downloadButton.style.color = 'white';
            downloadButton.style.border = 'none';
            downloadButton.style.cursor = 'pointer';
            document.body.appendChild(downloadButton);
        }
        downloadButton.onclick = showDownloadList;
    }

    function showDownloadList() {
        if (videoList.length === 0) {
            alert('No videos found.');
            return;
        }
        
        const listContainer = document.createElement('div');
        listContainer.style.position = 'fixed';
        listContainer.style.top = '50px';
        listContainer.style.right = '10px';
        listContainer.style.backgroundColor = 'white';
        listContainer.style.border = '1px solid black';
        listContainer.style.padding = '10px';
        listContainer.style.zIndex = '10001';
        listContainer.style.maxWidth = '300px';

        videoList.forEach((video, index) => {
            const videoItem = document.createElement('button');
            videoItem.innerText = video.includes('.m3u8') ? `Download & Merge m3u8 ${index + 1}` : `Download Video ${index + 1}`;
            videoItem.style.display = 'block';
            videoItem.style.margin = '5px 0';
            videoItem.style.width = '100%';
            videoItem.onclick = () => video.includes('.m3u8') ? downloadAndMergeM3U8(video) : promptAndDownload(video);
            listContainer.appendChild(videoItem);
        });

        document.body.appendChild(listContainer);
    }

    async function downloadAndMergeM3U8(m3u8Url) {
        const fileName = prompt("Enter a name for the downloaded video:", "video.mp4");
        if (!fileName) return;
        
        try {
            const m3u8Content = await fetch(m3u8Url).then(res => res.text());
            const tsUrls = m3u8Content.split('\n').filter(line => line.endsWith('.ts'));
            if (tsUrls.length === 0) {
                alert('No TS segments found.');
                return;
            }

            let tsBlobs = [];
            for (const tsUrl of tsUrls) {
                const tsBlob = await fetch(new URL(tsUrl, m3u8Url)).then(res => res.blob());
                tsBlobs.push(tsBlob);
            }

            const mergedBlob = new Blob(tsBlobs, { type: 'video/mp4' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(mergedBlob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('M3U8 download error:', error);
        }
    }

    function promptAndDownload(url) {
        if (!url) {
            console.warn("No video source found!");
            return;
        }
        
        let fileName = prompt("Enter a name for the downloaded video:", "video.mp4");
        if (!fileName) return;
        
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => console.error('Download error:', error));
    }

    function init() {
        detectVideos();
        if (videoList.length > 0) {
            showDownloadButton();
        }
    }

    setInterval(init, 5000);
})();

