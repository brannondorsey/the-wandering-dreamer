const RUNWAY_HOST = 'http://localhost'
const ATTNGAN_PORT   = 3000
const BIGGAN_PORT    = 3001
const IM2TXT_PORT    = 3002
const MOBILENET_PORT = 3003

const app = new Vue({
    el: '#app',
    data: {
        im2txtCaption: '',
        MobileNetCategory: '',
        AttnGANImages: [],
        BigGANImages: []
    }
})

function main() {

    const models = {}
    models['AttnGAN']   = new RunwayModel(`${RUNWAY_HOST}:${ATTNGAN_PORT}`)
    models['BigGAN']    = new RunwayModel(`${RUNWAY_HOST}:${BIGGAN_PORT}`)
    models['im2txt']    = new RunwayModel(`${RUNWAY_HOST}:${IM2TXT_PORT}`)
    models['MobileNet'] = new RunwayModel(`${RUNWAY_HOST}:${MOBILENET_PORT}`)

    models['AttnGAN'].netError(onModelNetworkError)
    models['BigGAN'].netError(onModelNetworkError)
    models['im2txt'].netError(onModelNetworkError)
    models['MobileNet'].netError(onModelNetworkError)

    models['BigGAN'].input({
        category: 'stingray',
        truncation: 0.4,
        seed: parseInt(randomInt(0, 1000))
    })

    models['BigGAN'].output((data) => {
        console.log('[BigGAN] Received an image')
        const image = data.generatedOutput
        models['im2txt'].input({ image: data.generatedOutput })
        addBigGANImage(image)
    })

    models['im2txt'].output((data) => {
        const caption = data.results[0].caption
        console.log(`[im2txt] ${caption}`)
        models['AttnGAN'].input({ caption })
        addIm2txtCaption(caption)
    })

    models['AttnGAN'].output((data) => {
        console.log('[AttnGAN] Received an image')
        const image = data.result
        models['MobileNet'].input({ image })
        addAttnGANImage(image)
    })

    models['MobileNet'].output((data) => {
        const category = data.results[0].className
        console.log(`[MobileNet] ${category}`)
        models['BigGAN'].input({
            category,
            truncation: 0.4,
            seed: parseInt(randomInt(0, 1000))
        })
        addMobileNetCategory(category)
    })

    document.getElementById('asterisk').onclick = (e) => {
        console.log('clicked')
        document.getElementById('info-modal').classList.toggle('hidden')
    }
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
    }, 2500)
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
    }, 2500)
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

function onModelNetworkError(err) {
    console.error('Model network error:')
    console.error(err)
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

main()
