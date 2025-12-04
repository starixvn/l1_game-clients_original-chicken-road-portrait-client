#!/usr/bin/python

import os
import shutil
import subprocess

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.realpath(__file__))
    project_dir = os.path.join(current_dir, '')

    images_dir = ".\chicken-road\images"

    # Pack.
    packer_path = os.path.join(
        project_dir,
        'pack.js'
    )

    outputPath = os.path.join(project_dir, '..\\', 'src\\assets\\resources\\images')
    subprocess.Popen([
        'node',
        packer_path,
        '-t',
        'remote',
        '-a',
        'http://10.10.50.17:3456',
        '-i',
        os.path.join(project_dir, images_dir, 'texture_packer.json'),
        '-o',
        outputPath
    ]).wait()

