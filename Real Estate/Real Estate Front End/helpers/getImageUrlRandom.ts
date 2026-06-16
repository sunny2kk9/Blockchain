const imageList = [
    "https://i.ibb.co/RT69sgg/kbsa.jpg", 
    "https://i.ibb.co/DKsjgLp/sip.jpg", 
    "https://i.ibb.co/6tDMrmQ/spv.jpg", 
    "https://i.ibb.co/MfLSBCP/rsa.jpg",
    "https://i.ibb.co/2vBhHDx/bk.jpg",
    "https://i.ibb.co/GQ0w7ZL/kc.jpg",
    "https://i.ibb.co/vd86JSZ/17088654326169wmn1uy2.png",
    "https://i.ibb.co/z4pbSx3/1708865441231cnb5goym.png"
];

export const getRandomImage = (images: string[] = imageList): string => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}