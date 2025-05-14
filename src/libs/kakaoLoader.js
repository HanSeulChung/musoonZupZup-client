// src/libs/kakaoLoader.js
export const loadKakaoMap = (kakaoKey) => {
    return new Promise((resolve) => {
        if (window.kakao && window.kakao.maps) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${kakaoKey}&libraries=services`;
            script.onload = () => {
                window.kakao.maps.load(() => {
                resolve();
                });
        };
        document.head.appendChild(script);
        }
    });
};
