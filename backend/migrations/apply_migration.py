#!/usr/bin/env python3
"""
Script per applicare la migrazione comment_report
Esegui con: python apply_migration.py
"""

import sqlite3
import os

# Path al database
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'instance', 'blog.db')

def apply_migration():
    """Applica la migrazione per creare la tabella comment_report"""
    
    # Leggi il file SQL
    sql_file = os.path.join(os.path.dirname(__file__), 'create_comment_report_table.sql')
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # Connetti al database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Esegui lo script SQL
        cursor.executescript(sql_script)
        conn.commit()
        print("✅ Migrazione applicata con successo!")
        print("✅ Tabella 'comment_report' creata")
        
        # Verifica che la tabella esista
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='comment_report'")
        result = cursor.fetchone()
        
        if result:
            print("✅ Verifica: tabella 'comment_report' trovata nel database")
            
            # Mostra la struttura della tabella
            cursor.execute("PRAGMA table_info(comment_report)")
            columns = cursor.fetchall()
            print("\n📋 Struttura della tabella:")
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
        else:
            print("❌ Errore: tabella non trovata dopo la migrazione")
            
    except Exception as e:
        conn.rollback()
        print(f"❌ Errore durante la migrazione: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == '__main__':
    print("🔧 Applicazione migrazione comment_report...")
    print(f"📁 Database: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database non trovato: {DB_PATH}")
        exit(1)
    
    apply_migration()
