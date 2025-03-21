// ==UserScript==
// @name         Safari Video Downloader
// @namespace    https://greasyfork.org/users/your-username
// @version      1.1
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
        
        let listHtml = 'Select a video to download:\n';
        videoList.forEach((video, index) => {
            listHtml += `${index + 1}: ${video}\n`;
        });
        
        let choice = prompt(listHtml + '\nEnter the number of the video to download:');
        let selectedIndex = parseInt(choice, 10) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < videoList.length) {
            downloadVideo(videoList[selectedIndex]);
        } else {
            alert('Invalid selection.');
        }
    }

    function downloadVideo(url) {
        if (!url) {
            console.warn("No video source found!");
            return;
        }
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `video_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function init() {
        detectVideos();
        if (videoList.length > 0) {
            showDownloadButton();
        }
    }

    setInterval(init, 5000);
})();

