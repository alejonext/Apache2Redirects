const http = require('http');
const RandExp = require('randexp');

describe("Apache2Redirect", function() {
  const Apache = require('../../lib/apache2Redirects.js');
  const PORT = 4500;
  const redirect = `http://localhost:${PORT}/`;

  const file = {
    'Redirect 301 "/kool/faa-fuu-foo" "/kool/faa-fuu"' : {
      type : 'Redirect',
      status : "301",
      regexp : "/kool/faa-fuu-foo",
      to : "/kool/faa-fuu"
    },
    'Redirect 301 "/kool/faa-fuu" "/kool/faa-fuu-foo"' : {
      type : 'Redirect',
      status : "301",
      regexp : "/kool/faa-fuu",
      to : "/kool/faa-fuu-foo"
    },
    'RedirectMatch 301 ^\/me-url\/and(.*)?\/?$ /other/$1' : {
      type : 'RedirectMatch',
      status : "301",
      regexp : "^\/me-url\/and(.*)?\/?$",
      to : "/other/$1"
    },
    'RedirectMatch 301 ^\/me\/and(.*)?\/?$ /other/$1' : {
      type : 'RedirectMatch',
      status : "301",
      regexp : "^\/me\/and(.*)?\/?$",
      to : "/other/$1"
    }
  };

  describe("- Funciones aparte", function() {
    it('- Unir Keys y Values desde array', function() {
      const obj = Apache.joinValKey( [1, 2 ], ['a', 'b']);
      expect(obj).toEqual({ a : 1, b : 2 });
    });

    describe("- Parse el archivo", function() {
      for(let i in file){
        it('- Test ' + i, function() {
          const result = Apache.parse(i + '\n');
          expect(result[0]).toEqual(file[i]);
        });
      }

      it('- Multiple lines', function() {
        let list = [];
        for (let i in file) {
          list.push(i);
        }

        const result = Apache.parse(list.join('\n'));
        expect(result.length).toEqual(list.length);
      });
    });
  });

  describe("- Probador de Clase", function() {
    var apache;
    var server;

    beforeAll(() => {
      server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        let list = [];
        for (let i in file) {
          list.push(i);
        }
        res.end(list.join('\n'));
      }).listen(PORT, () => apache = Apache({ redirect }));
    });

    it('- Se llama se crea', function() {
      apache = Apache();
      expect(apache instanceof Apache).toBeTruthy();
    });

    describe('- Opciones', function() {
      it('- Obtener archivo', function() {
        apache = Apache({ redirect });
        expect(apache.opts.redirect).toEqual(redirect);
      });
      it('- Uso interno', function() {
        const internal = [ 'test' ];
        apache = Apache({ internal });
        expect(apache.opts.internal).toEqual(internal);
      });
    })

    describe('- Ejecuciones de API', function() {
      beforeEach( async () => {
        await apache.getFile();
      });

      it('- Uso casos', () => {
        let values = [];
        for (let i in file) {
          values.push(file[i]);
        }
        expect(apache.cases).toEqual(values);
      });

      const functionTest = (test) => (() => {
        let urlTest = new RandExp(new RegExp(test.regexp, 'i'));
        urlTest.defaultRange.subtract(1, 125);
        const result = apache.API(urlTest.gen());
        expect(result).toBeDefined();
        expect(result.regexp).toBeDefined();
        expect(result.url).toBeDefined();
        expect(result.type).toEqual(test.type);
        expect(result.status).toEqual(test.status);
        expect(result.regexp).toEqual(test.regexp);
        expect(result.to).toEqual(test.to);
      });

      for (let i in file) {
        const test = file[i];
        it('- Uso de API ' + i, functionTest(test));
      }
    });
  });
});
