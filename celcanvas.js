/**
    A class to teach students about cel shading

    Assumes that
    ggslac/viewers/scenecanvas.js
    ggslac/viewers/basecanvas.js
    have been included already
 */


/**
 * 
 * @param {DOM Element} glcanvas Handle to HTML where the glcanvas resides
 */
function CelCanvas(glcanvas, shadersrelpath, meshesrelpath) {
    SceneCanvas(glcanvas, shadersrelpath, meshesrelpath);

    /** Initialize cel shaders */
    let gl = glcanvas.gl;
    let celShader = getShaderProgram(gl, "cel");
    celShader.vPosAttrib = gl.getAttribLocation(celShader, "vPos");
    gl.enableVertexAttribArray(celShader.vPosAttrib);
    celShader.vNormalAttrib = gl.getAttribLocation(celShader, "vNormal");
    gl.enableVertexAttribArray(celShader.normalAttrib);
    celShader.pMatrixUniform = gl.getUniformLocation(celShader, "uPMatrix");
    celShader.mvMatrixUniform = gl.getUniformLocation(celShader, "uMVMatrix");
    celShader.tMatrixUniform = gl.getUniformLocation(celShader, "tMatrix");
    celShader.nMatrixUniform = gl.getUniformLocation(celShader, "uNMatrix");
    celShader.ambientColorUniform = gl.getUniformLocation(celShader, "uAmbientColor");
    celShader.light1PosUniform = gl.getUniformLocation(celShader, "uLight1Pos");
    celShader.light1ColorUniform = gl.getUniformLocation(celShader, "uLight1Color");
    celShader.light1AttenUniform = gl.getUniformLocation(celShader, "uLight1Atten");
    celShader.uKaUniform = gl.getUniformLocation(celShader, "uKa");
    celShader.uKdUniform = gl.getUniformLocation(celShader, "uKd");
    celShader.uKsUniform = gl.getUniformLocation(celShader, "uKs");
    celShader.uShininessUniform = gl.getUniformLocation(celShader, "uShininess");
    celShader.uEyeUniform = gl.getUniformLocation(celShader, "uEye");
    celShader.uNumLevelsUniform = gl.getUniformLocation(celShader, "uNumLevels");
    glcanvas.celShader = celShader;

    /** Ink shader: A shader used to draw edges as line segments */
    let inkShader = getShaderProgram(gl, "ink");
    inkShader.vPosAttrib = gl.getAttribLocation(inkShader, "vPos");
    gl.enableVertexAttribArray(inkShader.vPosAttrib);
    inkShader.vNormalAttrib = gl.getAttribLocation(inkShader, "vNormal");
    gl.enableVertexAttribArray(inkShader.normalAttrib);
    inkShader.pMatrixUniform = gl.getUniformLocation(inkShader, "uPMatrix");
    inkShader.mvMatrixUniform = gl.getUniformLocation(inkShader, "uMVMatrix");
    inkShader.tMatrixUniform = gl.getUniformLocation(inkShader, "uTMatrix");
    inkShader.nMatrixUniform = gl.getUniformLocation(inkShader, "uNMatrix");
    inkShader.uEyeUniform = gl.getUniformLocation(inkShader, "uEye");
    glcanvas.inkShader = inkShader;


    /** Initialize updated repaint functions */
    glcanvas.repaintRecurse = function(node, transform) {
        let nextTransform = glMatrix.mat4.create();
        glMatrix.mat4.mul(nextTransform, transform, node.transform);
        let mvMatrix = glcanvas.camera.getMVMatrix();
        let pMatrix = glcanvas.camera.getPMatrix();
        node.shapes.forEach(function(shape) {
            if ('mesh' in shape) {
                if (!(shape.mesh === null)) {
                    if ('material' in shape) {
                        glcanvas.material = shape.material;
                    }
                    else if ('material' in glcanvas) {
                        delete glcanvas.material;
                    }
                    // There may be an additional transform to apply based
                    // on shape properties of special shapes (e.g. box width)
                    let tMatrix = glMatrix.mat4.create();
                    glMatrix.mat4.mul(tMatrix, nextTransform, shape.ms);
                    shape.mesh.render(glcanvas, tMatrix);
                    if (glcanvas.useCelShading) {
                        // Draw lines
                        let gl = glcanvas.gl;
                        let mesh = shape.mesh;
                        let sProg = glcanvas.inkShader;
                        let mvMatrix = glcanvas.camera.getMVMatrix();
                        let pMatrix = glcanvas.camera.getPMatrix();
                        gl.useProgram(sProg);
                        mesh.sendBuffersToGPU(glcanvas, sProg, pMatrix, mvMatrix, tMatrix);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.edgeIndexBuffer);
                        // Save line width from before
                        let lineWidth = gl.getParameter(gl.LINE_WIDTH);
                        gl.lineWidth(glcanvas.lineWidth);
                        gl.drawElements(gl.LINES, mesh.edgeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                        // Restore line width from before
                        gl.lineWidth(lineWidth);
                    }
                }
            }
        });
        if ('children' in node) {
            for (let i = 0; i < node.children.length; i++) {
                glcanvas.repaintRecurse(node.children[i], nextTransform);
            }
        }
    }

    glcanvas.oldRepaint = glcanvas.repaint;
    glcanvas.repaint = function() {
        let gl = glcanvas.gl;
        if (glcanvas.useCelShading) {
            gl.useProgram(glcanvas.celShader);
            gl.uniform1f(glcanvas.celShader.uNumLevelsUniform, glcanvas.NumLevels);
        }
        glcanvas.oldRepaint();
    }


    let menu = glcanvas.gui.addFolder('Cel Shading');
    glcanvas.useCelShading = false;
    menu.add(glcanvas, 'useCelShading').onChange(
        function(v) {
            if (v) {
                glcanvas.lastShader = glcanvas.shaderToUse;
                glcanvas.shaderToUse = glcanvas.celShader;
            }
            else {
                glcanvas.shaderToUse = glcanvas.lastShader;
            }
            requestAnimFrame(glcanvas.repaint);
        }
    );
    glcanvas.NumLevels = 8;
    menu.add(glcanvas, 'NumLevels', 1, 40).step(1).onChange(
        function() {
            requestAnimFrame(glcanvas.repaint);
        }
    );
    /*glcanvas.linecolor = [0, 0, 0];
    glcanvas.linecolor_rgb = "0,0,0";
    menu.addColor(glcanvas, 'linecolor_rgb').onChange(
        function(v) {
            glcanvas.linecolor = glMatrix.vec3.fromValues(v[0]/255, v[1]/255, v[2]/255);
            requestAnimFrame(glcanvas.repaint);
        }
    );*/
    glcanvas.lineWidth = 3;
    menu.add(glcanvas, 'lineWidth', 1, 10).onChange(
        function() {
            requestAnimFrame(glcanvas.repaint);
        }
    )
    glcanvas.celMenu = menu;
    glcanvas.gl.getExtension("EXT_frag_depth");
}
