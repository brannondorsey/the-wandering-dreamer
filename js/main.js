const app = new Vue({
    el: '#app',
    data: {
        im2txtCaption: '',
        MobileNetCategory: '',
        AttnGANImages: [],
        BigGANImages: []
    }
})

const CAPTION_DELAY = 2200;

async function main() {

    document.getElementById('asterisk').onclick = (e) => {
        document.getElementById('info-modal').classList.toggle('hidden')
    }

    const models = {}
    models['AttnGAN']    = new RunwayHostedModel(`https://attngan.hosted-models.runwayml.cloud/v1`, 'e5iKhIk5Ly90LElSND8M5g==')
    models['BigGAN']     = new RunwayHostedModel(`https://biggan.hosted-models.runwayml.cloud/v1`, 'Tmg5rPCP4fi8M8jyYPDIXw==')
    models['im2txt']     = new RunwayHostedModel(`https://im2txt.hosted-models.runwayml.cloud/v1`, 'OotKQhfwTCW8xEIQSMTV8w==')

    let output = await models['BigGAN'].query({
        category: 'stingray',
        z: randomZVector()
    })

    let image, caption, category
    while (true) {
        console.log('[BigGAN] Received an image')
        image = output.generated_output
        addBigGANImage(image)

        output = await models['im2txt'].query({ image })
        caption = output.caption
        console.log(`[im2txt] ${caption}`)
        addIm2txtCaption(caption)
        await delay(CAPTION_DELAY)

        output = await models['AttnGAN'].query({ caption })
        image = output.result
        console.log('[AttnGAN] Received an image')
        addAttnGANImage(image)

        output = await queryMobileNet(image)
        category = output[0].className
        console.log(`[MobileNet] ${category}`)
        addMobileNetCategory(category)
        await delay(CAPTION_DELAY)

        output = await models['BigGAN'].query({
            category,
            z: randomZVector()
        })
    }
}

async function loadImage(base64Image) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.hidden = true
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = base64Image
    })
}

let mobile = null
async function queryMobileNet(base64image) {
    const img = await loadImage(base64image)
    if (!mobile) mobile = await mobilenet.load()
    const predictions = await mobile.classify(img)
    return predictions
}

function randomZVector() {
    const vec = []
    for (let i = 0; i < 128; i++) vec[i] = randomGaussian()
    return vec
}

let gaussianCache = false
function randomGaussian(mean, sd) {
    let y1, x1, x2, w;
    if (gaussianCache) {
        y1 = y2;
        gaussianCache = false;
    } else {
        do {
            x1 = Math.random() * 2 - 1;
            x2 = Math.random() * 2 - 1;
            w = x1 * x1 + x2 * x2;
        } while (w >= 1);
        w = Math.sqrt(-2 * Math.log(w) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        gaussianCache = true;
    }
    const m = mean || 0;
    const s = sd || 1;
    return y1 * s + m;
}

function addBigGANImage(base64) {
    shiftImages(app.BigGANImages)
    const imgs = document.getElementsByClassName('biggan-image')
    fadeImages(imgs)
    app.BigGANImages.push(base64)
}

function addIm2txtCaption(caption) {
    caption = caption.replace(' .', '.')
    if (caption[caption.length - 1] !== '.') caption = caption + '.'
    app.im2txtCaption = `That's ${caption}`
    const el = document.getElementById('im2txt-caption')
    el.classList.add('fade-text-in')
    setTimeout(() => {
        el.classList.remove('fade-text-in')
        el.classList.add('fade-text-out')
        setTimeout(() => el.classList.remove('fade-text-out'), 500)
    }, CAPTION_DELAY)
}

function addAttnGANImage(base64) {
    shiftImages(app.AttnGANImages)
    const imgs = document.getElementsByClassName('attngan-image')
    fadeImages(imgs)
    app.AttnGANImages.push(base64)
}

function addMobileNetCategory(caption) {
    const first = caption.split(',')[0]
    app.MobileNetCategory = `That's a ${first}.`
    const el = document.getElementById('mobilenet-caption')
    el.classList.add('fade-text-in')
    setTimeout(() => {
        el.classList.remove('fade-text-in')
        el.classList.add('fade-text-out')
        setTimeout(() => el.classList.remove('fade-text-out'), 500)
    }, CAPTION_DELAY)
}

function shiftImages(arrayOfBase64) {
    if (arrayOfBase64.length > 4) {
        arrayOfBase64.shift()
    }
}

function fadeImages(imageElements) {
    let i = 1
    for (img of imageElements) {
        img.style.opacity = 0 + (i / imageElements.length) - 0.1
        i++
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function delay(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

main()
