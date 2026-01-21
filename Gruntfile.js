/**
 * When using enketo-core in your own app, you'd want to replace
 * this build file with one of your own in your project root.
 */
const fs = require('fs');
const path = require('path');
const nodeSass = require('node-sass');

module.exports = (grunt) => {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    const eslintInclude = [
        '*.js',
        'scripts/**/*.js',
        'src/**/*.js',
        'test/**/*.js',
        '!test/mock/forms.js',
    ];

    const karmaWatchOptions = {
        autoWatch: true,
        client: {
            mocha: {
                timeout: Number.MAX_SAFE_INTEGER,
            },
        },
        reporters: ['dots'],
        singleRun: false,
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concurrent: {
            develop: {
                tasks: [
                    'connect:server:keepalive',
                    'watch',
                ],
                options: {
                    logConcurrentOutput: true,
                },
            },
            test: {
                tasks: ['karma:watch', 'watch:transforms'],
                options: {
                    logConcurrentOutput: true,
                },
            },
        },
        connect: {
            server: {
                options: {
                    port: 8005,
                    base: ['test/forms', 'test/mock', 'test/temp', 'build'],
                },
            },
            test: {
                options: {
                    port: 8000,
                },
            },
        },
        eslint: {
            check: {
                src: eslintInclude,
            },
            fix: {
                options: {
                    fix: true,
                },
                src: eslintInclude,
            },
        },
        watch: {
            sass: {
                files: [
                    'grid/sass/**/*.scss',
                    'src/sass/**/*.scss',
                    'src/widget/**/*.scss',
                ],
                tasks: ['css'],
                options: {
                    spawn: true,
                    livereload: true,
                },
            },
            js: {
                files: [
                    'config.json',
                    '*.js',
                    'src/**/*.js',
                    'test/mock/forms.mjs',
                ],
                tasks: ['shell:build'],
                options: {
                    spawn: false,
                    livereload: true,
                },
            },
            transforms: {
                files: 'test/forms/*.xml',
                tasks: ['transforms'],
                options: {
                    spawn: true,
                    livereload: false,
                },
            },
        },
        karma: {
            options: {
                singleRun: true,
                configFile: 'test/karma.conf.js',
                customLaunchers: {
                    ChromeHeadlessNoSandbox: {
                        base: 'ChromeHeadless',
                        flags: ['--no-sandbox'],
                    },
                    ChromeHeadlessDebug: {
                        base: 'ChromeHeadless',
                        flags: ['--no-sandbox', '--remote-debugging-port=9333'],
                    },
                },
            },
            headless: {
                browsers: ['ChromeHeadlessNoSandbox'],
            },
            browsers: {
                browsers:
                    process.env.CI === 'true'
                        ? ['Chrome', 'Firefox']
                        : ['Chrome', 'Firefox', 'Safari'],
            },
            watch: {
                browsers: ['ChromeHeadlessDebug'],
                options: karmaWatchOptions,
            },
            watchBrowsers: {
                browsers: ['Chrome', 'Firefox', 'Safari'],
                options: karmaWatchOptions,
            },
        },
        sass: {
            options: {
                implementation: nodeSass,
                sourceMap: false,
                importer(url, prev, done) {
                    // Fixes enketo-core submodule references.
                    // Those references are correct in apps that use enketo-core as a submodule.
                    url = /\.\.\/\.\.\/node_modules\//.test(url)
                        ? url.replace('../../node_modules/', 'node_modules/')
                        : url;
                    done({
                        file: url,
                    });
                },
            },
            compile: {
                cwd: 'src/sass',
                dest: 'build/css',
                expand: true,
                outputStyle: 'expanded',
                src: '**/*.scss',
                ext: '.css',
                flatten: true,
                extDot: 'last',
            },
        },
        shell: {
            build: {
                command: 'node ./scripts/build.js',
            },
        },
    });

    grunt.loadNpmTasks('grunt-sass');

    /**
     * @param {string} path
     */
    const fileExists = (path) => {
        const stat = fs.statSync(path, {
            throwIfNoEntry: false,
        });

        return stat != null;
    };

    grunt.registerTask(
        'transforms',
        'Creating forms.js - DISABLED (enketo-transformer removed)',
        function transformsTask() {
            const done = this.async();
            const formsJsPath = './test/mock/forms.js';
            const formsESMPath = './test/mock/forms.mjs';
            
            // Create empty forms file since transformer is not available
            const fs = require('fs');
            
            if (!fs.existsSync(path.dirname(formsJsPath))) {
                fs.mkdirSync(path.dirname(formsJsPath), { recursive: true });
            }
            
            fs.writeFileSync(formsJsPath, 'export default {};');
            
            if (!fs.existsSync(formsESMPath)) {
                fs.linkSync(formsJsPath, formsESMPath);
            }
            
            grunt.log.writeln('Forms transformation skipped - enketo-transformer not available');
            done();
        }
    );

    grunt.registerTask('compile', ['shell:build']);
    grunt.registerTask('test', [
        'transforms',
        'eslint:check',
        'compile',
        'karma:headless',
        'css',
    ]);
    grunt.registerTask('test:watch', ['transforms', 'concurrent:test']);
    grunt.registerTask('css', ['sass']);
    grunt.registerTask('server', ['connect:server:keepalive']);
    grunt.registerTask('develop', [
        'css',
        'compile',
        'transforms',
        'concurrent:develop',
    ]);
    grunt.registerTask('default', ['css', 'compile']);
};
