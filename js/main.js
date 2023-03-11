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
            },

            locked: {
                type: Object,
                required: false,
            }
        },

        emits: ['change-is-done'],

        data() {
            return {
                title: '',
                notices: [],
            }
        },

        computed: {
            lastLockedStatus() {
                if(Object.keys(this.locked).length !== 0) {
                    return this.locked.isDone;
                } else return 0;
            },

            doneNoticesAmount() {
                let amount = 0;
                this.notices.forEach(elem => {
                    if(elem.isDone) amount++;
                });
                return amount;
            },
        },

        methods: {
            parseInput() {
                let data = this.input;
                this.title = data.title;
                this.notices = data.notices;
                this.id = data.id;
                this.isDone = data.isDone;
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

            leftColumnLock() {
                this.$emit('left-column-lock', this.id, this.notices);
            },

            leftColumnUnlock() {
                this.$emit('left-column-unlock')
            },

            clickToNotice(index) {
                this.completeNotice(index);

                if(this.middle < 5) this.noteIsDone();
                else if(this.doneNoticesAmount === 2 && this.isDone === 1) this.leftColumnLock();
                else if((this.doneNoticesAmount === 3 || this.doneNoticesAmount === 1 ) && this.isDone === 2 && this.lastLockedStatus === 1) {
                    this.leftColumnUnlock();
                    this.noteIsDone();
                } else {
                    this.noteIsDone();
                }
            }

        },
    }

    Vue.component('note', noteBody);
    let app = new Vue({
        el: '#app',
        data: {
            notes: [],
            lastLockedNote: {},
            leftColumnIsLock: false,
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
            },

            leftColumnLock(id, notices) {
                console.log('leftColumnLock');
                this.leftColumnIsLock = !this.leftColumnIsLock;
                this.lastLockedNote.id = id;
                this.lastLockedNote.notices = notices;
                this.lastLockedNote.isDone = 1;
            },

            leftColumnUnlock() {
                console.log('leftColumnUnlock');
                this.leftColumnIsLock = false;
                this.notes.forEach(elem => {
                   if(elem.id === this.lastLockedNote.id) {
                       elem.notices = this.lastLockedNote.notices;
                       elem.isDone = 2;
                       this.lastLockedNote.isDone = elem.isDone;
                   }
                });
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