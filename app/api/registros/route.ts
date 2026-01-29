import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '../../lib/db';

/**
 * GET
 * Obtiene registros con aprobacion = false
 */
export async function GET() {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT
        rf.RFC,
        c.name AS NOMBRE,
        rf.Periodo AS PERIODO,
        rf.aprobacion AS APROBACION
      FROM RegistrosFiscales rf
      INNER JOIN tb_clientes c
        ON c.rfc = rf.RFC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros' },
      { status: 500 }
    );
  }
}

/**
 * POST
 * true  -> aprobar
 * false -> rechazar (o mantener pendiente)
 */
export async function POST(req: Request) {
  try {
    const { rfc, aprobacion } = await req.json();

    if (!rfc || typeof aprobacion !== 'boolean') {
      return NextResponse.json(
        { error: 'RFC y aprobacion (boolean) son requeridos' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    await pool
      .request()
      .input('rfc', sql.VarChar(13), rfc)
      .input('aprobacion', sql.Bit, aprobacion)
      .query(`
        UPDATE RegistrosFiscales
        SET aprobacion = @aprobacion
        WHERE RFC = @rfc
      `);

    return NextResponse.json({
      message: aprobacion
        ? 'Registro aprobado correctamente'
        : 'Registro marcado como no aprobado',
    });
  } catch (error) {
    console.error('Error al actualizar aprobación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el registro' },
      { status: 500 }
    );
  }
}
