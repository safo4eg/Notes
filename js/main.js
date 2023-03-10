let noteTemplate = 'templates/note.html';

let templates = getTemplates(noteTemplate);
templates.then(array => {
    noteTemplate = array[0];

    let noteBody = {
        template: noteTemplate,

        props: {
            input: {
                type: Object,
                required: true
            },

            middle: {
                type: Number,
                required: true
            }
        },

        emits: ['change-is-done'],

        data() {
            return {
                title: '',
                notices: [],
            }
        },

        methods: {
            parseInput() {
                let data = this.input;
                this.title = data.title;
                this.notices = data.notices;
                this.id = data.id;
            },

            completeNotice(index) {
                this.notices.forEach((notice, i) => {
                   if(i === index) notice.isDone = !notice.isDone;
                });
            },

            noteIsDone() {
                let amountNotices = this.notices.length;
                let amountNoticesDone = 0;

                this.notices.forEach(elem => {
                    if(elem.isDone) amountNoticesDone++;
                });

                let isDone = 1;
                if(amountNoticesDone === amountNotices) isDone = 3;
                else if(amountNoticesDone / amountNotices >= 0.5) isDone = 2;
                else isDone = 1;

                this.$emit('change-is-done', isDone, this.id);
            },

            clickToNotice(index) {
                this.completeNotice(index);
                if(this.middle < 5) this.noteIsDone();
            }

        },
    }

    Vue.component('note', noteBody);
    let app = new Vue({
        el: '#app',
        data: {
            notes: [],
        },

        computed: {
            columnLeftAmount() {
                return this.countNotes('left');
            },

            columnMiddleAmount() {
                return this.countNotes('middle');
            },

            columnRightAmount() {
                return this.countNotes('right');
            }
        },

        methods: {
            changeIsDone(isDone, id) {
                this.notes.forEach(elem => {
                   if(elem.id === id) elem.isDone = isDone;
                });
            },

            addNote() {
                let lastId = 0;
                this.notes.forEach(elem => {lastId = elem.id});

                let obj = {
                    id: ++lastId,
                    title: `Заметка ${lastId}`,
                    notices: [],
                    isDone: 1
                };

                for(let i = 0; i < 3; i++) {
                    let notice = {message: `Задача ${i + 1}`, isDone: false}
                    obj.notices.push(notice);
                }

                this.notes.push(obj);
            }, // addNote

            countNotes(position) {
                let amount = 0;
                this.notes.forEach(elem => {
                    if(position === 'left') {
                        if(elem.isDone === 1) amount++;
                    } else if(position === 'middle') {
                        if(elem.isDone === 2) amount++;
                    } else if(position === 'right') {
                        if(elem.isDone === 3) amount++;
                    }
                });
                return amount;
            }
        }
    });
});


async function getTemplates(...pathTemplates) {
    let promises = [];

    for(let template of pathTemplates) {
        let promise = new Promise((resolve, reject) => {
            fetch(template).then(
                response => {
                    if(response.ok) resolve(response.text());
                    else reject('Ошибка');
                });
        });

        promises.push(promise);
    }

    let result = await Promise.all(promises);
    return result;
}