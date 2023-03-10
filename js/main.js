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
            }
        },

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

        },

        computed: {
            noteIsDone() {
                let amountNotices = this.notices.length;
                let amountNoticesDone = 0;
                this.notices.forEach(elem => {
                   if(elem.isDone) amountNoticesDone++;
                });

                if(amountNoticesDone === amountNotices) return  '= 100%';
                else {
                    if(amountNoticesDone / amountNotices >= 0.5) return '>= 50%';
                    return '< 50%'
                }
            }
        }
    }

    Vue.component('note', noteBody);
    let app = new Vue({
        el: '#app',
        data: {
            notes: [
                {
                    id: 1,
                    title: 'Заметка 1',
                    notices: [
                        {
                            message: 'Задача 1',
                            isDone: false,
                        },

                        {
                            message: 'Задача 2',
                            isDone: false,
                        },

                        {
                            message: 'Задача 3',
                            isDone: false,
                        }
                    ],
                },

                {
                    id: 1,
                    title: 'Заметка 2',
                    notices: [
                        {
                            message: 'Задача 1',
                            isDone: false,
                        },

                        {
                            message: 'Задача 2',
                            isDone: false,
                        },

                        {
                            message: 'Задача 3',
                            isDone: false,
                        }
                    ],
                },
            ],
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