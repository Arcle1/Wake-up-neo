// simple test

import { run } from '../src/main';
import { exec } from 'child_process';

const linter = 'bootlint';
exec(`npm install -g ${linter}`, (installErr,) => {
        if(installErr){
            console.log('Install error:', installErr);
        } else {
            exec(`${linter} --help`, (err, stdout, stderr) => {
                console.log(run(stdout.concat(stderr), linter))
            })
        }
    })