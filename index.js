/**
 *
 * var apache2 = require('Apache2Redirects');
 * var app = express();
 * app.use(apache2({
 *   redirect : 'https://my-wordpress/wp-content/uploads/wpseo-redirects/.redirects'
 * }).use);
 *
 */
function Apache2Redirects (opts) {
	if(!(this instanceof Apache2Redirects) ){
		return new Apache2Redirects(opts);
	}

	this._request = false;
	this.headers = {};
	this.cases = [];
	this.opts = {
		redirect : '',
		check : ((header) =>
      ( +header.now ) +
      ( parseInt(header.expires) * ( (/\.[0-9]{3}$/.test(header.expires) && 1000 ) || 1 ) )
      <= new Date()),
		flags : 'i',
    next : 'route',
    useRedirect : true,
		...opts,
	};

	this.getFile();
}
/**
 *
 * app.use(Httpd.use);
 *
 * @param  {Object}   req  Request element
 * @param  {Object}   res  Responce element
 * @param  {Function} next Callback
 */
Apache2Redirects.prototype.use = function(req, res, next) {
	let ele = this.API(req.path);

	if(ele && ele.status){
		let last = req.path.replace(new RegExp(ele.regexp, this.opts.flags), ele.to);

		if(last[0] != '/'){
			last = '/' + last;
		}

    if(this.opts.useRedirect){
      return res.redirect(parseInt(ele.status), last);
    } else {
      return next({
        url : last,
        status : ele.status
      });
    }
	}

	req.Httpd = ((url) => this.API(url));

	next(this.opts.next);
};

/**
 * Get the file in the Http
 * @param  {String} url Url where the file
 */
Apache2Redirects.prototype.getFile = function() {
	this._request = true;
	return require('request')(this.opts.redirect, (err, response, body) => {
		this._request = false;
		if(!err){
      this.cases = Apache2Redirects.parse(body);
			this.headers = response.headers;
			this.headers.now = new Date(); // LocalTime
		}
	});
};
/**
 * API
 *
 * Is the function select the redirections
 *
 * Example
 *  > Httpd.API('/my-kool-rediection');
 *  { regexp : "/my-kool-rediection",  to : "/end-redirection", status : '301', type : 'Redirect' }
 *  > Httpd.API('/other-rediection.html');
 *  { regexp : "^\/other\/redirection(.*)?\/?$",  to : "/end-redirection$&", status : '301', type : 'Redirect' }
 *
 * In file
 *
 * Redirect 301 "/my-kool-rediection" "/end-redirection"
 * RedirectMatch 301 ^\/other\/redirection(.*)?\/?$ /end-redirection$&
 *
 * @param {String} url Url check the element enter
 * @return {Object.status}     Status code
 * @return {Object.type}       Type redirection
 * @return {Object.regexp}     Regular Expression
 * @return {Object.to}         End path in raw
 */
Apache2Redirects.prototype.API = function(url) {
	if(!this._request && this.opts.check(this.headers)){
		this.getFile();
	}

	return this.cases.find(e => ( new RegExp(e.regexp, this.opts.flags) ).test(url));
};
/**
 * Parse the body file
 * @param  {String} body The body of the file in raw (UTF-8)
 * @return {Array}       Array the redirections see the format in API
 */
Apache2Redirects.parse = function(body) {
  let lines = body.split(Apache2Redirects.LINES);
  let cases = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    let redirect = {};
    if(Apache2Redirects.START.test(lines[i])){
      for (let z = 0; z < Apache2Redirects.BODY_VALUES.length; z++) {
        let e = Apache2Redirects
          .joinValKey(
            Apache2Redirects.BODY_VALUES[z](lines[i]),
            Apache2Redirects.BODY_TYPES[z]);

        if(e){
          redirect = { ...e, ...redirect };
          if(Object.keys(redirect).length == Apache2Redirects.BODY_NUM ){
            break;
          }

          lines[i] = Apache2Redirects.BODY_CLEAN(lines[i]);
        }
      }

      if(redirect){
        cases.push(redirect);
      }
    }
  }

  return cases.filter(e => Object.keys(e).length == Apache2Redirects.BODY_NUM );
};
/**
 * [joinValKey description]
 * @param  {Array|null} values  Is the match elements, is values
 * @param  {Array}      keys    Is the Keys
 * @return {Object|boolean}     When no exists the same number keys and values is false
 */
Apache2Redirects.joinValKey = function (values, keys) {
	if(values && values.length == keys.length){
		let obj = {};
		for (let i = keys.length - 1; i >= 0; i--) {
			obj[keys[i]] = values[i];
		}

		return obj;
	} else {
		return false;
	}
};

Apache2Redirects.BODY_TYPES = [
  [ 'type', 'status' ],
  [ 'regexp', 'to' ],
  [ 'regexp', 'to' ],
];

Apache2Redirects.BODY_NUM = Apache2Redirects.BODY_TYPES
  .reduce((e, w) => w.concat(e), [] )
  .filter((e, i, a) => a.indexOf(e) == i).length;

/**
 * @type {Functions[]} Split the content
 */
Apache2Redirects.BODY_VALUES = [
  ((body) => body.match(Apache2Redirects.START)[0].split(Apache2Redirects.ELEMENTS)),
  ((body) => body.split(Apache2Redirects.URL).filter(e => e.trim()) ),
  ((body) => body.split(Apache2Redirects.ELEMENTS).filter(e => e.trim()))
];

Apache2Redirects.BODY_CLEAN = (body) => body.replace(Apache2Redirects.START, '').trim();

Apache2Redirects.LINES = /\n/igm;
Apache2Redirects.START = /^Redirect(Match)? [0-9]{3}/igm;
Apache2Redirects.ELEMENTS = /\s/;
Apache2Redirects.URL = /"(.*?)"/gim;

module.exports = Apache2Redirects;