// ==UserScript==
// @name         M3U8视频下载助手
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  自动检测并下载网页中的m3u8视频
// @author       YourName
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_registerMenuCommand
// @connect      *
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 检测m3u8资源
    function detectM3U8() {
        const videoElements = document.querySelectorAll('video');
        let m3u8Links = [];

        videoElements.forEach(video => {
            try {
                const src = video.currentSrc || video.src;
                if (src.includes('.m3u8')) {
                    m3u8Links.push({
                        url: src,
                        quality: video.getAttribute('quality') || '默认'
                    });
                }
            } catch(e) {/* 安全策略处理 */}
        });

        return m3u8Links;
    }

    // 创建下载按钮
    function createDownloadUI() {
        const btn = document.createElement('button');
        btn.style = `position:fixed;top:20px;right:20px;z-index:9999;
                    padding:10px;background:#2196F3;color:white;border:none;
                    border-radius:5px;cursor:pointer;`;
        btn.textContent = '下载视频';
        btn.onclick = showDownloadOptions;
        document.body.appendChild(btn);
    }

    // 显示下载选项
    async function showDownloadOptions() {
        const m3u8List = detectM3U8();
        if(m3u8List.length === 0) return alert('未检测到m3u8视频');

        const container = document.createElement('div');
        container.style = `position:fixed;top:60px;right:20px;background:white;
                          padding:20px;box-shadow:0 0 10px rgba(0,0,0,0.2);z-index:9999;`;

        m3u8List.forEach((item, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p>清晰度：${item.quality}</p>
                <button data-url="${item.url}" 
                        style="padding:5px 10px;margin:5px;background:#4CAF50;color:white;border:none;">
                    下载
                </button>
            `;
            div.querySelector('button').onclick = () => startDownload(item.url);
            container.appendChild(div);
        });

        document.body.appendChild(container);
    }

    // 下载处理
    async function startDownload(m3u8Url) {
        const fileName = prompt('请输入保存文件名（无需扩展名）:', 'video_'+Date.now());
        if(!fileName) return;

        try {
            const tsFiles = await fetchTSList(m3u8Url);
            const zip = new JSZip();

            for(let i=0; i<tsFiles.length; i++) {
                const tsData = await fetchTS(tsFiles[i]);
                zip.file(`segment_${i}.ts`, tsData);
            }

            const content = await zip.generateAsync({type:"blob"});
            const downloadUrl = URL.createObjectURL(content);
            
            GM_download({
                url: downloadUrl,
                name: `${fileName}.zip`,
                onload: () => URL.revokeObjectURL(downloadUrl)
            });

        } catch(e) {
            alert('下载失败: ' + e.message);
        }
    }

    // 获取TS文件列表
    async function fetchTSList(m3u8Url) {
        const response = await fetch(m3u8Url);
        const text = await response.text();
        return text.split('\n')
            .filter(line => line.endsWith('.ts'))
            .map(ts => new URL(ts, m3u8Url).href);
    }

    // 获取单个TS片段
    async function fetchTS(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "arraybuffer",
                onload: (res) => resolve(res.response),
                onerror: reject
            });
        });
    }

    // 初始化
    setTimeout(() => {
        if(detectM3u8().length > 0) {
            createDownloadUI();
        }
    }, 3000);
})();
