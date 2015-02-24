;
(function(exports) {
    "use strict";

    Parse.TodoRouter = Parse.Router.extend({
        initialize: function() {
            console.log("initialized");
            this.collection = new Parse.TodoActualList();
            this.view = new Parse.TodoView({ //list
                collection: this.collection
            });
            this.authview = new Parse.AuthView({});
            // this.view2 = new Parse.TodoViewDetail({});//details, need to create this page
            this.isLoggedIn();
            Parse.history.start();
        },
        routes: {
            "login": "login",
            "*default": "home",
            "details/:item": "showDetail"
        },
        isLoggedIn: function() {
            this.user = Parse.User.current();
            if (!this.user) {
                this.navigate("login", {trigger: true}); //this is a simple check
                return false;
            }
            return true;
        },
        home: function() {
            if (!this.isLoggedIn())
            return; //return is just exciting the function if they are not logged in

            var query = new Parse.Query(Parse.TaskModel);
            query.equalTo("user", this.user);
            // query.startsWith("description: h");
            this.collection.query = query;
            this.collection.fetch(); // matt has this on his, why? do I need this? This just finds all the tasks return to parse and creates models
            this.view.render();
            // this.view2.render(); //Temporary: we'll move the detail view later
        },
        login: function() {
            this.authview.render();
        },
        showDetail: function(item) {
            // this.view2.render();
            console.log(item);
        }
    })
    Parse.TodoView = Parse.TemplateView.extend({
        el: ".container",
        view: "PAppQ", //--points to parseToDoapp.html
        events: {
            "submit .tasks": "addTask",
            "change input[name= 'urgent']": "toggleUrgent", //if input is urgent, then toggleUrgent function
            "change input[name= 'isDone']": "toggleIsDone",
            "keyup .description": "setDescription"
        },
        addTask: function(event) {
            event.preventDefault();
            debugger;
            var data = {
                description: this.el.querySelector("input[name= 'John']").value,
                user: Parse.User.current()
            }
            this.collection.create(data, { //does an .add AND creates a new model and saves it
                validate: true
            })
            console.log("Yay!");
            // debugger;
        },
        getModelAssociatedWithEvent: function(event) { //should always return a model
            var el = event.target,
                li = $(el).closest('li').get(0),
                id = li.getAttribute('id'),
                m = this.collection.get(id);

            return m;

        },
        toggleUrgent: function(event) {
            var m = this.getModelAssociatedWithEvent(event);
            if (m) {
                m.set('urgent', !m.get('urgent'));

                this.colletion.sort();
                this.render();
            }
        },
        toggleIsDone: function(event) {
            var m = this.getModelAssociatedWithEvent(event);
            if (m) {
                m.set('isDone', !m.get('isDone'));
                if (m.get('isDone')) {
                    m.set('urgent', false);
                }
                this.collection.sort();
                this.render();
            }
        },
        setDescription: function(event) {
            var m = this.getModelAssociatedWithEvent(event);
            if (m) {
                m.set('description', event.target.innerText);
                m.save();
            }
        }
    })

    Parse.AuthView = Parse.TemplateView.extend({
            el: ".container1",
            view: "authview",
            events: {
                "submit .login": "login",
                "submit .register": "register"
            },
            login: function(event) {
                event.preventDefault();
                var data = {
                    username: this.el.querySelector(".login input[name='email']").value,
                    password: this.el.querySelector(".login input[name= 'password']").value
                }
                var result = Parse.User.logIn(data.username, data.password);
                result.then(function() {
                    window.location.hash = "#view"
                })
                result.fail(function(error) {
                    alert(error.message);
                })
            },
            register: function(event) {
                event.preventDefault();
                var data = {
                    username: this.el.querySelector(".register input[name= 'email']").value,
                    password1: this.el.querySelector(".regiser input[name= 'password1']").value,
                    password2: this.el.querySelector(".register input[name='password2']").value
                }
                if (data.password1 !== data.password2) {
                    alert("Passwords must match");
                    return;
                }
                var user = new Parse.User();
                user.set('username', data.username)
                user.set('email', data.username)
                user.set('password', data.password1)

                var result = user.signUp()
                result.then(function(user) {
                    window.location.hash = "#view"
                    alert("Welcome home, " + user.get("username"));
                })
                result.fail(function(error) {
                    alert(error.message);
                })
            }
    });
    Parse.TaskModel = Parse.Object.extend({
        className: "description",
        defaults: {
            isDone: false,
            urgent: false,
            dueDate: null,
            tags: [],
            description: "no description given"
        },
        initialize: function() {
            this.on("change", function(){ //listening for change on it's own attributes/events
                this.save(); //save is backbone; sends the info back online to parse.com, to specific id is given to object, automatically saves
            })
        }
    });
    Parse.TodoActualList = Parse.Collection.extend({
        model: Parse.TaskModel,
        comparator: function(a, b) { //this is to alphabetize the list
            if (a.get('urgent') && !b.get('urgent') || !a.get('isDone') && b.get('isDone'))
                return -1;
            if (a.get('isDone') && !b.get('isDone') || !a.get('urgent') && b.get('urgent'))
                return 1;

            return a.get('description') > b.get('description') ? 1 : -1;
        }
    })


})(typeof module === "object" ? module.exports : window)

        // NEED TO PARSE THE VIEW BELOW AFTER I MAKE SURE IT WORKS
        // Parse.TodoViewDetail = Parse.TemplateView.extend({
        //     el: ".container2",
        //     view: "todoDetails",
        //     initialize: function(options) { //we have to create our own inintialize b/c TemplateView.extend has own initialize function
        //         this.options = options;
        //         this.listenTo(Parse, "newModelForDetailView", this.setModel) //listening to line 78
        //         this.model && this.model.on("change", this.render.bind(this)); //
        //         this.collection && this.collection.on("add reset remove", this.render.bind(this));
        //     },
        // })

//     setModel: function(model){
//         if(this.model === model){//model is NOT line 77
//             this.model = null;
//             this.el.innerHTML = "";
//         } else {
//             this.model = model;
//             this.render();
//         }
//     }
// })

// debugger;
// Parse.TodoModel = Parse.Model.extend({
//     defaults: {
//         "checked": "false",
//         "title": "No title given.",
//         "done": "false"
//     },
//     validate: function(data) {
//         // debugger;
//         var x = data.title.length > 0;

//         // debugger;
//         if (!x) {
//             return "Title Required.";
//         }
//     }
// })
