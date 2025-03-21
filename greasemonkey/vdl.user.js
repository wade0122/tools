// ==UserScript==
// @name         Safari Video Downloader
// @namespace    https://greasyfork.org/users/your-username
// @version      1.2
// @description  Detect playing videos and show a download button for HLS (m3u8) videos in Safari
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
        document.querySelectorAll('video').forEach(video => {
            if (video.src && !videoList.includes(video.src)) {
                videoList.push(video.src);
            }
        });
        document.querySelectorAll('source').forEach(source => {
            if (source.src && !videoList.includes(source.src)) {
                videoList.push(source.src);
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
            videoItem.innerText = `Download Video ${index + 1}`;
            videoItem.style.display = 'block';
            videoItem.style.margin = '5px 0';
            videoItem.style.width = '100%';
            videoItem.onclick = () => downloadVideo(video);
            listContainer.appendChild(videoItem);
        });

        document.body.appendChild(listContainer);
    }

    function downloadVideo(url) {
        if (!url) {
            console.warn("No video source found!");
            return;
        }
        
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `video_${Date.now()}.mp4`;
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

