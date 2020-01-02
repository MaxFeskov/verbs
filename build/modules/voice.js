import { isArr, copyArr } from './arrays.js';

export function getVoicesList(cb, lang) {
  var result = [];
  var synth = window.speechSynthesis

  if (synth !== undefined) {
    synth.addEventListener('voiceschanged', () => {
      var voices = window.speechSynthesis.getVoices();

      if (isArr(voices)) {
        if (lang) {
          voices.forEach(voice => {
            if (voice.lang == lang) {
              result.push(voice);
            }
          });
        } else {
          result = copyArr(voices);
        }
      }

      if (isFunc(cb)) cb(result);
    }, { once: true });
  } else {
    if (isFunc(cb)) cb(result);
  }
}

export function speakVoice(text, voice) {
  if (text && voice) {
    var toSpeak = new SpeechSynthesisUtterance(text);
    toSpeak.voice = voice;
    window.speechSynthesis.speak(toSpeak);
  }
}

function isFunc(func) {
  if (func && typeof func == 'function') return true;
}
