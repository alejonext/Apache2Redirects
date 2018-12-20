# Apache2Redirects

Yoru file in Apache2

```
Redirect 301 "/kool/faa-fuu-foo" "/kool/faa-fuu"
Redirect 301 "/kool/blass-fuu-foo" "/kool/hee-fuu"
Redirect 301 "/kool/hee-fuu-jao" "/kool/hee-fuu"
Redirect 301 "/url/ bla " "/url/bla"
Redirect 301 "/url/ foo" "/url/foo"
Redirect 301 "/kool/bla-buu-space" "/kool/bla-buu"
Redirect 301 "/kool/foo" "/kool/foo-el-recomendador"
RedirectMatch 301 ^\/me-url\/and(.*)?\/?$ /other/$1
RedirectMatch 301 ^\/foo\/bar(.*)?\/?$ /go-to/$1
Redirect 301 "/url/foo" "/url#foo"
```

In Expressjs

```js
const express = require('express');
const apache2 = require('Apache2Redirects')({
  source : {
    // URL
    http : 'http://apache2.kool/redirect',
    //File system
    file : '../apache2/redirect.conf',
    // Internal
    internal : [{
      regexp : "/my-kool-rediection",
      to : "/end-redirection", 
      status : '301'
    }]
  }
});

var app = express();

app.use(apache2.use);
app.post('/redirect', (req, res) => res.json(req.Httpd(req.body.url)));
```

## Options

* `source`: Is a `object` with url or elements to redirect
* `flags` : Is flags in RegExp
* `next` : Is the result when is NOT in file redirections
* `useRedirect` : Use `res.redirect` the expressjs
* `check` : Is a functions, is return a Boolean, and arguments is the Headers of the file.

That's all!!