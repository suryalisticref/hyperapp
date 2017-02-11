module.exports = function (options) {
    var view = options.view
    var render = options.render

    function setLocation(data) {
        render(route(view, data))
        history.pushState({}, "", data)
    }

    window.addEventListener("popstate", function () {
        render(route(view, location.pathname))
    })

    window.addEventListener("click", function (e) {
        if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) {
            return
        }

        var target = e.target

        while (target && target.localName !== "a") {
            target = target.parentNode
        }

        if (target && target.host === location.host
            && !target.hasAttribute("data-no-routing")) {

            var element = target.hash === "" ? element : document.querySelector(target.hash)
            if (element) {
                element.scrollIntoView(true)

            } else {
                setLocation(target.pathname)
                e.preventDefault()
            }
        }
    })

    render(route(view, location.pathname))

    function route(routes, path) {
        for (var route in routes) {
            var re = regexify(route), params = {}, match

            path.replace(new RegExp(re.re, "g"), function () {
                for (var i = 1; i < arguments.length - 2; i++) {
                    params[re.keys.shift()] = arguments[i]
                }

                match = function (model, actions) {
                    actions.setLocation = setLocation
                    return routes[route](model, actions, params, setLocation)
                }
            })

            if (match) {
                return match
            }
        }

        return views["/"]
    }

    function regexify(path) {
        var keys = [], re = "^" + path
            .replace(/\//g, "\\/")
            .replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
                keys.push(key)
                return "([A-Za-z0-9_]+)"
            }) + "/?$"

        return { re: re, keys: keys }
    }
}

