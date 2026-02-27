const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
let files = [];
let replaceIndex = -1;
const fileInput = document.getElementById('file-input');
const replaceInput = document.getElementById('replace-input');
const errorMsg = document.getElementById('error-msg');
const fileList = document.getElementById('file-list');
const submitSec = document.getElementById('submit-section');
const submitSumm = document.getElementById('submit-summary');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-msg');
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'File type not allowed' };
    }
    if (file.size > MAX_SIZE) {
        return { valid: false, error: 'Too large (>10MB)' };
    }
    return { valid: true, error: null };
}
fileInput.addEventListener('change', (e) => {
    errorMsg.textContent = '';
    successMsg.textContent = '';
    const newFiles = Array.from(e.target.files);
    if (files.length + newFiles.length > MAX_FILES) {
        errorMsg.textContent = `You can only upload up to ${MAX_FILES} files.`;
        return;
    }
    newFiles.forEach(f => {
        const validation = validateFile(f);
        const url = URL.createObjectURL(f);
        files.push({ file: f, valid: validation.valid, error: validation.error, url });
    });
    fileInput.value = '';
    renderList();
});
replaceInput.addEventListener('change', (e) => {
    if (replaceIndex === -1 || !e.target.files.length) return;
    errorMsg.textContent = '';
    successMsg.textContent = '';
    const newFile = e.target.files[0];
    const validation = validateFile(newFile);
    const url = URL.createObjectURL(newFile);
    URL.revokeObjectURL(files[replaceIndex].url);
    files[replaceIndex] = {
        file: newFile,
        valid: validation.valid,
        error: validation.error,
        url: url
    };
    replaceIndex = -1;
    replaceInput.value = '';
    renderList();
});
function renderList() {
    fileList.innerHTML = '';
    let validCount = 0;
    files.forEach((item, index) => {
        if (item.valid) validCount++;
        const div = document.createElement('div');
        div.className = 'file-item' + (item.valid ? '' : ' invalid');
        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `<strong>${item.file.name}</strong> <span class="file-size">(${formatSize(item.file.size)})</span><br>
                      ${item.valid ? '<span style="color:green">Valid</span>' : `<span style="color:red">${item.error}</span>`}`;
        const btnGroup = document.createElement('div');
        if (item.valid) {
            const previewBtn = document.createElement('button');
            previewBtn.textContent = 'Preview';
            previewBtn.onclick = () => window.open(item.url, '_blank');
            btnGroup.appendChild(previewBtn);
        }
        const replaceBtn = document.createElement('button');
        replaceBtn.textContent = 'Replace';
        replaceBtn.onclick = () => {
            replaceIndex = index;
            replaceInput.value = '';
            replaceInput.click();
        };
        btnGroup.appendChild(replaceBtn);
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            URL.revokeObjectURL(item.url);
            files.splice(index, 1);
            renderList();
        };
        btnGroup.appendChild(removeBtn);
        div.appendChild(info);
        div.appendChild(btnGroup);
        fileList.appendChild(div);
    });
    submitSec.style.display = files.length ? 'block' : 'none';
    submitBtn.disabled = validCount === 0;
    submitSumm.textContent = `${validCount} valid file(s) ready to submit.`;
}
submitBtn.addEventListener('click', () => {
    successMsg.textContent = `Successfully submitted ${files.filter(f => f.valid).length} file(s)!`;
    files.forEach(item => URL.revokeObjectURL(item.url));
    files = [];
    setTimeout(renderList, 2000);
});
