const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Configura el middleware para analizar las solicitudes JSON rut_alumno
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config_bd = {
    user: "postgres",
    host: "localhost",
    database: 'ASON',
    password: "",
    port: 5433,
  };
  
  const pool = new Pool(config_bd);

 //API's

//TRAER INFORMACION DOCENTE
app.get("/traerDocente",  async (req, res) => {
    try {
      const response = await pool.query(
        "SELECT nombre_docente, especialidad, titulo, telefono_docente, correo_docente FROM docente"
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });
  
  //CREAR DOCENTE
  app.post("/crearDocente", async (req, res) => {
    try {
      const obj = JSON.stringify(req.body);
      console.log(obj);
  
      const reservas =
        "INSERT INTO docente(nombre_docente,apellido_docente,contraseña_docente,correo_docente,telefono_docente,especialidad,titulo) VALUES($1,$2,$3,$4,$5,$6,$7)";
  
      const values = [
        req.body.nombre_docente,
        req.body.apellido_docente,
        req.body.contraseña_docente,
        req.body.correo_docente,
        req.body.telefono_docente,
        req.body.especialidad,
        req.body.titulo,
      ];
      
       await pool.query(reservas, values);
  
      res.status(200).send("Docente creado exitosamente");
    } catch (e) {
      res.status(500).json({ message: e });
    }
  });
  
  //EDITAR DOCENTE 
  app.post("/editarDocente", async (req, res) => {
    try {
      const obj = JSON.stringify(req.body);
      console.log(obj);
  
      const text =
        "UPDATE docente SET (nombre_docente,apellido_docente,correo_docente,telefono_docente,especialidad,titulo) VALUES($1,$2,$3,$4,$5)";
      const value = [
        req.body.nombre_docente,
        req.body.apellido_docente,
        req.body.telefono_docente,
        req.body.correo_docente,
        req.body.especialidad,
        req.body.titulo,
      ];
  
      const res = await pool.query(text, value);
  
      res.status(200).json(obj);
    } catch (e) {
      res.status(500).json({ message: e });
    }
  });
  
  //BORRAR DOCENTE
  app.post("/borrarDocente", async (req, res) => {
    try {
      const obj = JSON.stringify(req.body);
      console.log(obj);
  
      const text = "DELETE FROM docente WHERE id_docente= $1";
      const value = [req.body.id_docente];
  
      const res = await pool.query(text, value);
  
      res.status(200).json(obj);
    } catch (e) {
      res.status(500).json({ message: e });
    }
  });
  
// TRAER INFO ALUMNO
app.get("/traerAlumno",  async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT a.nombre_alumno, a.apellido_alumno, a.diagnostico, a.descripcion, a.rut_alumno, a.curso, a.fecha_nacimiento, a.edad, a.modalidad, a.derivacion, a.matricula, ma.nombre_madre, ma.apellido_madre, ma.correo_madre, ma.celular_madre, pa.nombre_padre, pa.apellido_padre, pa.correo_padre, pa.celular_padre, ha.dia, ha.hora_inicio, ha.hora_fin, da.calle, da.numero_casa, da.comuna, da.block, da.departamento FROM alumno a LEFT JOIN madre_alumno ma ON a.rut_alumno = ma.rut_alumno LEFT JOIN padre_alumno pa ON a.rut_alumno = pa.rut_alumno LEFT JOIN horario_alumno ha ON a.rut_alumno = ha.rut_alumno LEFT JOIN direccion_alumno da ON a.rut_alumno = da.rut_alumno;"
    );

    // Extraer solo los datos de los alumnos de la sección "rows"
    const alumnos = response.rows;

    res.status(200).json(alumnos);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});


  
  //CREAR ALUMNO 
  app.post("/crearAlumno", async (req, res) => {
    try {
      const alumnoValues = [
        req.body.nombre_alumno,
        req.body.apellido_alumno,
        req.body.diagnostico,
        req.body.curso,
        req.body.descripcion,
        req.body.rut_alumno,
        req.body.fecha_nacimiento,
        req.body.edad,
        req.body.correo_docente, 
        req.body.modalidad,
        req.body.derivacion,
        req.body.matricula,
      ];
  
      const madreValues = [
        req.body.nombre_madre,
        req.body.apellido_madre,
        req.body.correo_madre,
        req.body.celular_madre,
        
      ];
  
      const padreValues = [
        req.body.nombre_padre,
        req.body.apellido_padre,
        req.body.correo_padre,
        req.body.celular_padre,
        
      ];
  
      const horarioValues = [
        req.body.dia,
        req.body.hora_inicio,
        req.body.hora_fin,
        
      ];
  
      const direccionValues = [
        req.body.calle,
        req.body.numero_casa,
        req.body.comuna,
        req.body.block,
        req.body.departamento,
  
      ];
  
      const client = await pool.connect();
  
      try {
        await client.query("BEGIN");
  
        // Insertar en la tabla "alumno"
        const alumnoQuery =
          "INSERT INTO alumno(nombre_alumno,apellido_alumno,diagnostico,curso,descripcion,rut_alumno,fecha_nacimiento,edad,correo_docente,modalidad,derivacion,matricula) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING rut_alumno";
        const alumnoResult = await client.query(alumnoQuery, alumnoValues);
  
        const idAlumno = alumnoResult.rows[0].rut_alumno;
  
        // Insertar en la tabla "madre_alumno"
        const madreQuery =
          "INSERT INTO madre_alumno(rut_alumno,nombre_madre,apellido_madre,correo_madre,celular_madre) VALUES($1,$2,$3,$4,$5)";
        await client.query(madreQuery, [idAlumno, ...madreValues]);
  
        // Insertar en la tabla "padre_alumno"
        const padreQuery =
          "INSERT INTO padre_alumno(rut_alumno,nombre_padre,apellido_padre,correo_padre,celular_padre) VALUES($1,$2,$3,$4,$5)";
        await client.query(padreQuery, [idAlumno, ...padreValues]);
  
        // Insertar en la tabla "horario_alumno"
        const horarioQuery =
          "INSERT INTO horario_alumno(rut_alumno,dia,hora_inicio,hora_fin) VALUES($1,$2,$3,$4)";
        await client.query(horarioQuery, [idAlumno, ...horarioValues]);
  
        // Insertar en la tabla "direccion_alumno"
        const direccionQuery =
          "INSERT INTO direccion_alumno(rut_alumno,calle,numero_casa,comuna,block,departamento) VALUES($1,$2,$3,$4,$5,$6)";
        await client.query(direccionQuery, [idAlumno, ...direccionValues]);
  
        await client.query("COMMIT");
        res.status(200).send("Alumno creado exitosamente");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al crear alumno:", error);
        res.status(500).send("Error al crear alumno");
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).send("Error de conexión a la base de datos");
    }
  });
  
  //EDITAR ALUMNO 
  app.post("/editarAlumno", async (req, res) => {
    try {
      const obj = JSON.stringify(req.body);
      console.log(obj);
  
      const idAlumno = req.body.rut_alumno; 
  
      const alumnoValues = [
        req.body.nombre_alumno,
        req.body.apellido_alumno,
        req.body.diagnostico,
        req.body.curso,
        req.body.descripcion,
        req.body.rut_alumno,
        req.body.fecha_nacimiento,
        req.body.edad,
        req.body.id_docente,
        req.body.modalidad,
        req.body.derivacion,
        req.body.matricula,
        idAlumno, 
      ];
  
      const madreValues = [
        req.body.nombre_madre,
        req.body.apellido_madre,
        req.body.correo_madre,
        req.body.celular_madre,
        idAlumno, 
      ];
  
      const padreValues = [
        req.body.nombre_padre,
        req.body.apellido_padre,
        req.body.correo_padre,
        req.body.celular_padre,
        idAlumno, 
      ];
  
      const horarioValues = [
        req.body.dia,
        req.body.hora_inicio,
        req.body.hora_fin,
        idAlumno, 
      ];
  
      const direccionValues = [
        req.body.calle,
        req.body.numero_casa,
        req.body.comuna,
        req.body.block,
        req.body.departamento,
        idAlumno, 
      ];
  
      const client = await pool.connect();
  
      try {
        await client.query("BEGIN");
  
        // Actualizar en la tabla "alumno"
        const alumnoQuery =
          "UPDATE alumno SET nombre_alumno=$1, apellido_alumno=$2, diagnostico=$3, curso=$4, descripcion=$5, fecha_nacimiento=$6, edad=$7, id_docente=$8, modalidad=$9, derivacion=$10, matricula=$11 WHERE rut_alumno=$12";
        await client.query(alumnoQuery, alumnoValues);
  
        // Actualizar en la tabla "madre_alumno"
        const madreQuery =
          "UPDATE madre_alumno SET nombre=$1, apellido=$2, correo=$3, celular=$4 WHERE rut_alumno=$5";
        await client.query(madreQuery, madreValues);
  
        // Actualizar en la tabla "padre_alumno"
        const padreQuery =
          "UPDATE padre_alumno SET nombre=$1, apellido=$2, correo=$3, celular=$4 WHERE rut_alumno=$5";
        await client.query(padreQuery, padreValues);
  
        // Actualizar en la tabla "horario_alumno"
        const horarioQuery =
          "UPDATE horario_alumno SET dia=$1, hora_inicio=$2, hora_fin=$3 WHERE id_alumno=$4";
        await client.query(horarioQuery, horarioValues);
  
        // Actualizar en la tabla "direccion_alumno"
        const direccionQuery =
          "UPDATE direccion_alumno SET calle=$1, numero_casa=$2, comuna=$3, block=$4, departamento=$5 WHERE id_alumno=$6";
        await client.query(direccionQuery, direccionValues);
  
        await client.query("COMMIT");
        res.status(200).json({ message: "Alumno editado exitosamente" });
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al editar alumno:", error);
        res.status(500).json({ message: "Error al editar alumno" });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).json({ message: "Error de conexión a la base de datos" });
    }
  });
  
  
  //BORRAR ALUMNO
  app.post("/borrarAlumno", async (req, res) => {
    try {
      const obj = JSON.stringify(req.body);
      console.log(obj);
  
      const idAlumno = req.body.id_alumno; // Asegúrate de tener el ID del alumno
  
      const client = await pool.connect();
  
      try {
        await client.query("BEGIN");
  
        // Borrar en la tabla "direccion_alumno"
        const direccionQuery =
          "DELETE FROM direccion_alumno WHERE id_alumno = $1";
        await client.query(direccionQuery, [idAlumno]);
  
        // Borrar en la tabla "horario_alumno"
        const horarioQuery =
          "DELETE FROM horario_alumno WHERE id_alumno = $1";
        await client.query(horarioQuery, [idAlumno]);
  
        // Borrar en la tabla "padre_alumno"
        const padreQuery =
          "DELETE FROM padre_alumno WHERE id_alumno = $1";
        await client.query(padreQuery, [idAlumno]);
  
        // Borrar en la tabla "madre_alumno"
        const madreQuery =
          "DELETE FROM madre_alumno WHERE id_alumno = $1";
        await client.query(madreQuery, [idAlumno]);
  
        // Borrar en la tabla "alumno"
        const alumnoQuery =
          "DELETE FROM alumno WHERE id_alumno = $1";
        await client.query(alumnoQuery, [idAlumno]);
  
        await client.query("COMMIT");
        res.status(200).json({ message: "Alumno borrado exitosamente" });
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error al borrar alumno:", error);
        res.status(500).json({ message: "Error al borrar alumno" });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error de conexión a la base de datos:", error);
      res.status(500).json({ message: "Error de conexión a la base de datos" });
    }
  });
   

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Express iniciado en el puerto ${port}`);
});
