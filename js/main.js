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
                this.notices = data.messages;
                this.isDone = data.isDone;
            }
        }
    }

    Vue.component('note', noteBody);
    let app = new Vue({
        el: '#app',
        data: {
            notes: [
                {
                    title: 'Заметка 1',
                    messages: [
                        {
                            message: 'Задача 1',
                            isDone: false,
                        },

                        {
                            message: 'Задача 1',
                            isDone: false,
                        },

                        {
                            message: 'Задача 1',
                            isDone: false,
                        }
                    ],
                    isDone: false
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