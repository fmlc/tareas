CREATE TABLE USUARIO(
	ID        SERIAL NOT NULL PRIMARY KEY,
	NOMBRE    VARCHAR(50) NOT NULL,
	APELLIDOS VARCHAR(50) NOT NULL,
	FOTO      TEXT,
	USUARIO   VARCHAR(50) NOT NULL,
	PASSWORD  VARCHAR(50) NOT NULL,
	STATUS    CHARACTER(1) DEFAULT 'A'
);

CREATE TABLE TAREAS(
	ID          SERIAL NOT NULL PRIMARY KEY,
	ID_USUARIO  INT,
	TITULO      VARCHAR(100) NOT NULL,
	DESCRIPCION TEXT NOT NULL,
	TMODIFI     TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY(ID_USUARIO) REFERENCES USUARIO(ID)
);

CREATE TABLE SUBTAREAS(
	ID          SERIAL NOT NULL PRIMARY KEY,
	ID_TAREA    INT,
	DESCRIPCION TEXT NOT NULL,
	TMODIFI     TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY(ID_TAREA) REFERENCES TAREAS(ID)
);

CREATE TABLE HISTORIAL(
	ID         SERIAL NOT NULL ,
	ID_USUARIO INT,
	FECHA      DATE NOT NULL DEFAULT NOW(),
	ACTIVIDAD  TEXT NOT NULL,
	TMODIFI    TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY(ID_USUARIO) REFERENCES USUARIO(ID)
);

--DROP TABLE SUBTAREAS;
--DROP TABLE TAREAS;
--DROP TABLE HISTORIAL;
--DROP TABLE USUARIO;

----------------------------
----- FUNCION PARA EL LOGIN
----- DROP FUNCTION F_LOGIN;
-----------------------------
CREATE FUNCTION F_LOGIN(_USER VARCHAR(50), _PASS VARCHAR(50))
RETURNS 
	TABLE(
		RS        BOOL,
		MSG       text,
	    ID        INT,
		NOMBRE    VARCHAR(50),
		APELLIDOS VARCHAR(50),
		FOTO      TEXT,
		STATUS    CHARACTER(1))
AS
$BODY$
DECLARE
	N_CONTADOR INT;
BEGIN
	CREATE TEMP
		TABLE T_TABLA(
			RS        BOOL,
			MSG       text,
			ID        INT,
			NOMBRE    VARCHAR(50),
			APELLIDOS VARCHAR(50),
			FOTO      TEXT,
			STATUS    CHARACTER(1)
		)ON COMMIT DROP;
	IF LENGTH(_USER) < 3 OR LENGTH(_PASS) < 3 THEN 
		IF LENGTH(_USER) < 3 THEN 
			INSERT INTO T_TABLA(RS, MSG) VALUES (FALSE, 'ERROR EL USUARIO DEBE INGRESAR 3 CARACTERES MINIMO');
		END IF;
		IF LENGTH(_PASS) < 3 THEN 
			INSERT INTO T_TABLA(RS, MSG) VALUES (FALSE, 'ERROR LA CONTRASEÑA DEBE INGRESAR 3 CARACTERES MINIMO');
		END IF;
	ELSE 
		PERFORM * FROM USUARIO WHERE USUARIO = _USER AND PASSWORD = md5(_PASS) AND USUARIO.STATUS <> 'X';
		IF NOT FOUND THEN
			INSERT INTO T_TABLA(RS, MSG) VALUES (FALSE, 'ERROR USUARIO NO ENCONTRADO');
		ELSE
			INSERT INTO T_TABLA SELECT TRUE, 'SUCCESS', USUARIO.ID, USUARIO.NOMBRE, USUARIO.APELLIDOS, USUARIO.FOTO, USUARIO.STATUS 
				FROM USUARIO 
				WHERE 
					USUARIO.USUARIO = _USER AND 
					USUARIO.PASSWORD = md5(_PASS);
		END IF;
	END IF;
	RETURN QUERY SELECT * FROM T_TABLA;		
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

----------------------------------------
------- FUNCION PARA CREAR NUEVO USUARIO 
------- DROP FUNCTION F_NEWUSUARIO;
------------------------------------------
CREATE FUNCTION F_NEWUSUARIO(
	_NOMBRE    VARCHAR(50),
	_APELLIDOS VARCHAR(50),
	_USUARIO   VARCHAR(50),
	_PASS      VARCHAR(50)
) RETURNS INTEGER 
AS $BODY$
DECLARE RS INTEGER;
		_NEWPASS VARCHAR(100);
BEGIN
	PERFORM * FROM USUARIO WHERE USUARIO.USUARIO = _USUARIO;
	IF FOUND THEN
		RS = -1;
	ELSE 
		_NEWPASS = MD5(REPLACE(_PASS, ' ', ''));
		INSERT INTO USUARIO (NOMBRE, APELLIDOS, USUARIO, PASSWORD) VALUES (UPPER(_NOMBRE),UPPER(_APELLIDOS),REPLACE(_USUARIO, ' ', ''),_NEWPASS);
		RS = (SELECT USUARIO.ID FROM USUARIO WHERE USUARIO.USUARIO = _USUARIO);
	END IF;
	RETURN RS;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

--------------------------------------------------
---- FUNCION PARA ACTUALIZAR DATOS DE LOS USUARIO
---- DROP FUNCTION F_UPDATEUSUARIO;
---------------------------------------------------

CREATE FUNCTION F_UPDATEUSUARIO (_ID INTEGER, _PASS VARCHAR(50) DEFAULT '', _FOTO TEXT DEFAULT '')
RETURNS BOOL 
AS $BODY$
DECLARE _RS BOOL;
BEGIN
	IF _PASS <> '' THEN
		UPDATE USUARIO SET PASSWORD = MD5(_PASS) WHERE USUARIO.ID = _ID;
		_RS = TRUE;
	ELSEIF _FOTO <> '' THEN 
		UPDATE USUARIO SET FOTO = _FOTO WHERE USUARIO.ID = _ID;
		_RS = TRUE;
	ELSE 
		_RS = FALSE;
	END IF;
	RETURN _RS;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

----------------------------------
----- VISTA TAREAS
----- DROP VIEW V_TAREAS
-----------------------------------
CREATE VIEW V_TAREAS
AS
SELECT ID, ID_USUARIO, TITULO, DESCRIPCION 
FROM TAREAS ORDER BY ID;

---------------------------------------
---- FUNCION CREAR, ACTUALIZAR Y ELIMINAR TAREA
---- DROP FUNCTION F_TAREAS
---------------------------------------

CREATE FUNCTION F_TAREAS(
	_ACTION      INT, 
	_ID_USUARIO  INT, 
	_ID_TAREA    INT DEFAULT -1, 
	_TITULO      VARCHAR(50) DEFAULT '', 
	_DESCRIPCION TEXT DEFAULT '')
RETURNS BOOL
AS $BODY$
DECLARE 
	RC INT;
BEGIN
	CASE 
		WHEN _ACTION = 1 THEN -- CREAR 
			INSERT INTO TAREAS(ID_USUARIO, TITULO, DESCRIPCION) VALUES (_ID_USUARIO, _TITULO, _DESCRIPCION);
		WHEN _ACTION = 2 THEN -- MODIFICAR 
			UPDATE TAREAS SET TITULO = _TITULO, DESCRIPCION = _DESCRIPCION WHERE ID_USUARIO = _ID_USUARIO AND ID = _ID_TAREA;			
		WHEN _ACTION = 3 THEN -- ELIMINAR 
			DELETE FROM SUBTAREAS WHERE ID_TAREA = _ID_TAREA;
			DELETE FROM TAREAS WHERE ID = _ID_TAREA;
		ELSE 
			RETURN FALSE;
	END CASE;
	GET DIAGNOSTICS RC = ROW_COUNT;
	IF RC = 0 THEN
		RETURN FALSE;
		ROLLBACK;
	END IF;
	RETURN TRUE;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;
	
	
----------------------------------------------------------------------------
----- VISTA SUB TAREAS
----- DROP VIEW V_SUBTAREAS
----------------------------------------------------------------------------

CREATE VIEW V_SUBTAREAS
AS
SELECT ID_TAREA, ID, DESCRIPCION, TO_CHAR(TMODIFI,'YYYY-MM-DD') AS FECHA FROM SUBTAREAS;

----------------------------------------------------------------------------
----- FUNCTION CREAR, MODIFICAR Y ELIMINAR SUB TAREAS
----- DROP FUNCTION F_SUB_TAREAS
----------------------------------------------------------------------------
CREATE FUNCTION F_SUB_TAREAS(
	_ACTION      INT, 
	_ID_TAREA    INT, 
	_ID_ST       INT DEFAULT 0, 
	_DESCRIPCION TEXT DEFAULT '')
RETURNS BOOL
AS $BODY$
DECLARE 
	_RC INT;
BEGIN
	CASE
		WHEN _ACTION = 1 THEN
			INSERT INTO SUBTAREAS(ID_TAREA, DESCRIPCION, TMODIFI) VALUES (_ID_TAREA, _DESCRIPCION, NOW());
		WHEN _ACTION = 2 THEN
			UPDATE SUBTAREAS SET DESCRIPCION = _DESCRIPCION, TMODIFI = NOW() WHERE ID_TAREA = _ID_TAREA AND ID = _ID_ST;
		WHEN _ACTION = 3 THEN
			DELETE FROM SUBTAREAS WHERE ID_TAREA = _ID_TAREA AND ID = _ID_ST;
		ELSE 
			RETURN FALSE;
	END CASE;
	GET DIAGNOSTICS _RC = ROW_COUNT;
	IF _RC = 0 THEN 
		RETURN FALSE;
		ROLLBACK;
	END IF;
	RETURN TRUE;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

------------------------------------------------------------
--------- TRIGGER TAREA REGISTRO EN EL HISTORIAL - NUEVO REGISTRO
--------- DROP TRIGGER T_TAREA on TAREAS;
--------- DROP FUNCTION F_T_TAREA;
-------------------------------------------------------------

CREATE FUNCTION F_T_TAREA() RETURNS TRIGGER
AS $BODY$
BEGIN 
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (NEW.ID_USUARIO, NOW(), 'SE REGISTRO UNA TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

------------------------------------------------------------
--------- TRIGGER TAREA REGISTRO EN EL HISTORIAL - ACTUALIZAR
--------- DROP TRIGGER T_TAREA_U on TAREAS;
--------- DROP FUNCTION F_T_TAREA_U;
-------------------------------------------------------------

CREATE FUNCTION F_T_TAREA_U() RETURNS TRIGGER
AS $BODY$
BEGIN 
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (NEW.ID_USUARIO, NOW(), 'SE REGISTRO UNA MODIFICACION EN UNA TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;


CREATE TRIGGER T_TAREA_U AFTER UPDATE ON TAREAS
FOR EACH ROW
EXECUTE PROCEDURE F_T_TAREA_U();

------------------------------------------------------------
--------- TRIGGER TAREA REGISTRO EN EL HISTORIAL - ELIMINAR
--------- DROP TRIGGER T_TAREA_D on TAREAS;
--------- DROP FUNCTION F_T_TAREA_D;
-------------------------------------------------------------

CREATE FUNCTION F_T_TAREA_D() RETURNS TRIGGER
AS $BODY$
BEGIN 
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (NEW.ID_USUARIO, NOW(), 'SE ELIMINO UNA TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;


CREATE TRIGGER T_TAREA_D AFTER DELETE ON TAREAS
FOR EACH ROW
EXECUTE PROCEDURE F_T_TAREA_D();

------------------------------------------------------------
--------- TRIGGER SUBTAREA REGISTRO EN EL HISTORIAL - NUEVO REGISTRO
--------- DROP TRIGGER T_SUBTAREA on SUBTAREAS;
--------- DROP FUNCTION P_T_SUBTAREA;
-------------------------------------------------------------

CREATE FUNCTION P_T_SUBTAREA() RETURNS TRIGGER
AS $BODY$
DECLARE 
	_ID_USUARIO INT;
BEGIN 
	SELECT U.ID INTO _ID_USUARIO
		FROM USUARIO U
		INNER JOIN TAREAS T ON T.ID_USUARIO = U.ID
		INNER JOIN SUBTAREAS S ON S.ID_TAREA = T.ID
		WHERE S.ID = NEW.ID;
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (_ID_USUARIO, NOW(), 'SE REGISTRO UNA SUB TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;

------------------------------------------------------------
--------- TRIGGER SUBTAREA REGISTRO EN EL HISTORIAL - ACTUALIZAR
--------- DROP TRIGGER T_SUBTAREA_U on SUBTAREAS;
--------- DROP FUNCTION P_T_SUBTAREA_U;
-------------------------------------------------------------

CREATE FUNCTION P_T_SUBTAREA_U() RETURNS TRIGGER
AS $BODY$
DECLARE 
	_ID_USUARIO INT;
BEGIN 
	SELECT U.ID INTO _ID_USUARIO
		FROM USUARIO U
		INNER JOIN TAREAS T ON T.ID_USUARIO = U.ID
		INNER JOIN SUBTAREAS S ON S.ID_TAREA = T.ID
		WHERE S.ID = OLD.ID;
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (_ID_USUARIO, NOW(), 'SE REGISTRO UNA MODIFICACION EN UNA SUB TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN NEW;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;


CREATE TRIGGER T_SUBTAREA_U AFTER UPDATE ON SUBTAREAS
FOR EACH ROW
EXECUTE PROCEDURE P_T_SUBTAREA_U();


------------------------------------------------------------
--------- TRIGGER SUBTAREA REGISTRO EN EL HISTORIAL - ELIMINAR
--------- DROP TRIGGER T_SUBTAREA_D on SUBTAREAS;
--------- DROP FUNCTION P_T_SUBTAREA_D;
-------------------------------------------------------------

CREATE FUNCTION P_T_SUBTAREA_D() RETURNS TRIGGER
AS $BODY$
DECLARE 
	_ID_USUARIO INT;
BEGIN 
	SELECT U.ID INTO _ID_USUARIO
		FROM USUARIO U
		INNER JOIN TAREAS T ON T.ID_USUARIO = U.ID
		INNER JOIN SUBTAREAS S ON S.ID_TAREA = T.ID
		WHERE S.ID = OLD.ID;
	INSERT INTO HISTORIAL(ID_USUARIO,FECHA,ACTIVIDAD) VALUES (_ID_USUARIO, NOW(), 'SE ELIMINO UNA SUB TAREA ' || TO_CHAR(now(),'YYYY-MM-DD HH24:mi'));
	RETURN OLD;
END;
$BODY$
LANGUAGE PLPGSQL VOLATILE
COST 100;


CREATE TRIGGER T_SUBTAREA_D BEFORE DELETE ON SUBTAREAS
FOR EACH ROW
EXECUTE PROCEDURE P_T_SUBTAREA_D();

CREATE TRIGGER T_SUBTAREA AFTER INSERT ON SUBTAREAS
FOR EACH ROW
EXECUTE PROCEDURE P_T_SUBTAREA();