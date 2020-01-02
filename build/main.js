import { loadJSONList } from './modules/loaders.js';
import {
  isObj, isEmptyObj, isEqualObj,
} from './modules/objects.js';
import {
  getVoicesList, speakVoice,
} from './modules/voice.js';
import { rndArr } from './modules/arrays.js';

const dictList = [
  'equal',
  '1-3',
  '2-3',
  '2-3-d-t',
  '2-3-ee-et',
  '2-3-n',
  '2-3-t',
  '2-3-ught',
  '2-ew',
  '3-en',
  'i-a-u',
  'other',
];

(() => {
  class Dictonary {
    constructor() {
      this.timeout = 4000;

      const JSONList = [];

      dictList.forEach((item) => {
        JSONList.push(`data/${item}.json`);
      });

      this.questionEl = document.getElementById('question');
      this.answerEl = document.getElementById('answer');
      this.checkEl = document.getElementById('check');
      this.countEl = document.getElementById('count');
      this.form = document.getElementById('form');
      this.getAnswerEl = document.getElementById('getanswer');
      this.queue = [];

      loadJSONList(JSONList).then(
        (data) => {
          this.data = Object.assign({}, ...data);

          for (let i = 0; i < Object.keys(this.data).length; i += 1) this.queue.push(i);

          this.count =
            parseInt(window.location.search.substr(1), 10) || Object.keys(this.data).length;

          rndArr(this.queue);

          if (this.count >= Object.keys(this.data).length) {
            this.count = Object.keys(this.data).length;
          } else {
            this.queue.splice(this.count);
          }

          const totalcountEl = document.getElementById('total-count');
          if (totalcountEl) totalcountEl.innerHTML = this.count;

          this.startCheck();
          this.initEvents();
          this.getVoice();
        },
        (error) => {
          console.log('error', error);
        },
      );
    }

    startCheck() {
      this.getQuestion();
    }

    initEvents() {
      if (this.form) {
        this.form.addEventListener('submit', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.checkAnswer();
          return false;
        });
      }

      if (this.getAnswerEl) {
        this.getAnswerEl.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.getAnswer();

          return false;
        });
      }
    }

    getVoice() {
      getVoicesList((voices) => {
        [this.voice] = rndArr(voices.filter(v => v.lang === 'en-GB'));
        if (!this.voice) [this.voice] = rndArr(voices.filter(v => v.lang === 'en-US'));
      });
    }

    getQuestion() {
      if (this.answerEl && this.questionEl) {
        if (isObj(this.data) && !isEmptyObj(this.data)) {
          this.number = this.queue.shift();

          const question = Object.entries(this.data)[this.number][0];
          this.questionEl.innerHTML = question;
          this.answerEl.value = '';

          if (this.countEl) this.countEl.innerHTML = this.count - this.queue.length - 1;
          this.enabled();
        } else if (this.countEl) {
          this.countEl.innerHTML = this.count;
          this.disabled();
          this.questionEl.innerHTML = 'done!';
        }
      }
    }

    getNextQuestion() {
      if (this.queue.length) {
        this.getQuestion();
      } else {
        this.countEl.innerHTML = this.count;
        this.disabled();
        this.questionEl.innerHTML = 'done!';
      }
    }

    checkAnswer() {
      if (this.answerEl && this.questionEl) {
        if (isObj(this.data) && !isEmptyObj(this.data)) {
          const answers = this.answerEl.value.split(', ');
          const rightAnswers = this.data[this.questionEl.innerHTML];
          const count = answers.length;

          if (rightAnswers && count) {
            if (isEqualObj(answers, rightAnswers)) {
              if (!this.isSpeaked) {
                this.speakVoice(rightAnswers.join(', '));
                this.disabled();

                setTimeout(() => {
                  this.getNextQuestion();
                }, this.timeout);
              } else {
                this.isSpeaked = false;
                this.getNextQuestion();
              }
            }
          }
        }
      }
    }

    getAnswer() {
      if (this.answerEl && this.questionEl) {
        if (isObj(this.data) && !isEmptyObj(this.data)) {
          const rightAnswers = this.data[this.questionEl.innerHTML];

          if (rightAnswers) {
            this.answerEl.value = rightAnswers.join(', ');
            this.speakVoice(rightAnswers.join(', '));
            this.isSpeaked = true;
            this.queue.push(this.number);
            this.disabled();

            if (this.form) {
              setTimeout(() => {
                this.form.dispatchEvent(new Event('submit'));
              }, this.timeout);
            }
          }
        }
      }
    }

    disabled() {
      if (this.answerEl) {
        this.answerEl.setAttribute('disabled', 1);
        this.getAnswerEl.setAttribute('disabled', 1);
        this.checkEl.setAttribute('disabled', 1);
      }
    }

    enabled() {
      if (this.answerEl) {
        this.answerEl.removeAttribute('disabled');
        this.answerEl.focus();
        this.getAnswerEl.removeAttribute('disabled');
        this.checkEl.removeAttribute('disabled');
      }
    }

    speakVoice(text) {
      if (text) speakVoice(text, this.voice);
    }
  }

  const dictonary = new Dictonary();
})();
