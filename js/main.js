let noteTemplate = 'templates/note.html';
let noteEditTemplate = 'templates/note-edit.html';

let templates = getTemplates(noteTemplate, noteEditTemplate);
templates.then(array => {
    noteTemplate = array[0];
    noteEditTemplate = array[1];

    let noteBody = {
        template: noteTemplate,

        props: {
            input: {
                type: Object,
                required: true
            },

            left: {
                type: Number,
                required: false,
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

        emits: ['change-is-done', 'left-column-unlock', 'left-column-lock', 'edit', 'save'],

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

                let percent = amount / this.notices.length;

                if(percent < 0.5) return 1;
                else if(percent >= 0.5 && percent < 1) return 2;
                else if(percent === 1) return 3;
            },
        },

        methods: {
            parseInput() {
                let data = this.input;
                this.title = data.title;
                this.notices = data.notices;
                this.id = data.id;
                this.isDone = data.isDone;
                this.isEdit = data.isEdit;
                this.time = data.time;
            },

            completeNotice(index) {
                this.notices.forEach((notice, i) => {
                   if(i === index) notice.isDone = !notice.isDone;
                });
            },

            noteIsDone() {
                let amountNotices = this.notices.length;
                let amountNoticesDone = 0;
                let time = 0;

                this.notices.forEach(elem => {
                    if(elem.isDone) amountNoticesDone++;
                });

                let isDone = 1;
                if(amountNoticesDone === amountNotices) isDone = 3;
                else if(amountNoticesDone / amountNotices >= 0.5) isDone = 2;
                else isDone = 1;

                if(this.doneNoticesAmount === 3) {
                    let date = new Date()
                    let year = date.getFullYear();
                    let month = date.getMonth();
                    let day = date.getDate();
                    let hoursAndMinutes = `${date.getHours()}:${date.getMinutes()}`;
                    time = `${year}-${month}-${day} ${hoursAndMinutes}`;
                };

                this.$emit('change-is-done', isDone, this.id, time);
            },

            leftColumnLock() {
                this.$emit('left-column-lock', this.id, this.notices);
            },

            leftColumnUnlock() {
                this.$emit('left-column-unlock')
            },

            clickToNotice(index) {
                this.completeNotice(index);

                if((this.doneNoticesAmount === 1 && this.isDone === 2 && this.left === 3) || this.isDone === 3) this.completeNotice(index);
                else if(this.middle < 5) this.noteIsDone();
                else if(this.doneNoticesAmount === 2 && this.isDone === 1) this.leftColumnLock();
                else if((this.doneNoticesAmount === 3 || this.doneNoticesAmount === 1 ) && this.isDone === 2 && this.lastLockedStatus === 1) {
                    this.leftColumnUnlock();
                    this.noteIsDone();
                } else this.noteIsDone();
            },

            edit(id) {
                this.$emit('edit', id);
            },

            saveChanges(id, title, notices) {
                this.$emit('save', id, title, notices);
            },

            cancelChanges(id) {
                this.$emit('cancel', id);
            }

        },
    }

    let noteEditBody = {
        template: noteEditTemplate,
        props: {
            title: {
                type: String,
                required: true,
            },

            notices: {
                type: Array,
                required: true,
            },

            id: {
                type: Number,
                required: true,
            }
        },

        emits: ['save'],

        data() {
            return {
                changes: {
                    title: this.title,
                    notices: this.notices,
                },
            }
        },

        computed: {
            noticesAmount() {
                return this.notices.length;
            }
        },

        methods: {
            add() {
                let numberNotice = this.noticesAmount;
                this.notices.push({message: `Задача ${++numberNotice}`, isDone: false})
            },

            save() {
                this.$emit('save', this.id, this.title, this.notices);
            },

            cancel() {
                this.$emit('cancel', this.id);
            }
        }
    }

    Vue.component('note', noteBody);
    Vue.component('note-edit', noteEditBody);
    let app = new Vue({
        el: '#app',
        data: {
            notes: [],
            lastLockedNote: {},
            leftColumnIsLock: false,
        },

        mounted() {
            this.getFromStorage();
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
            },

        },

        methods: {

            setToStorage() {
                if(this.notes.length !== 0) localStorage.setItem('notes', JSON.stringify(this.notes));
            },

            getFromStorage() {
                let notes = JSON.parse(localStorage.getItem('notes'));
                if(notes.length !== 0) this.notes = notes;
            },

            changeIsDone(isDone, id, time) {
                this.notes.forEach(elem => {
                   if(elem.id === id) {
                       elem.isDone = isDone;
                       if(time !== 0) elem.time = time;
                   }
                });
            },

            addNote() {
                let lastId = 0;
                this.notes.forEach(elem => {lastId = elem.id});

                let obj = {
                    id: ++lastId,
                    title: `Заметка ${lastId}`,
                    notices: [],
                    isDone: 1,
                    isEdit: false,
                    time: false,
                };

                for(let i = 0; i < 3; i++) {
                    let notice = {message: `Задача ${i + 1}`, isDone: false}
                    obj.notices.push(notice);
                }

                this.notes.push(obj);
            }, // addNote

            editNote(id) {
                this.notes.forEach(elem => {
                   if(elem.id === id) elem.isEdit = !elem.isEdit;
                });
            },

            saveChanges(id, title, notices) {
                this.notes.forEach(elem => {
                    if(elem.id === id) {
                        elem.title = title;
                        elem.notices = notices;
                        elem.isEdit = false;
                    }
                });
            },

            cancelChanges(id) {
                this.notes.forEach(elem => {
                    if(elem.id === id) elem.isEdit = !elem.isEdit;
                });
            },

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