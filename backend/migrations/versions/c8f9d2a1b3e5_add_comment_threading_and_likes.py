"""add comment threading and likes system

Revision ID: c8f9d2a1b3e5
Revises: c4c6843b76f2
Create Date: 2025-01-19 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'c8f9d2a1b3e5'
down_revision = 'c4c6843b76f2'  # Ultima migrazione esistente
branch_labels = None
depends_on = None


def upgrade():
    # Verifica se le colonne esistono già per evitare errori
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Aggiungi colonne al modello Comment se non esistono già
    existing_columns = [col['name'] for col in inspector.get_columns('comment')]
    
    with op.batch_alter_table('comment', schema=None) as batch_op:
        if 'parent_id' not in existing_columns:
            batch_op.add_column(sa.Column('parent_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_comment_parent_id', 'comment', ['parent_id'], ['id'])
        
        if 'status' not in existing_columns:
            batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False, server_default='approved'))
        
        if 'reported' not in existing_columns:
            batch_op.add_column(sa.Column('reported', sa.Boolean(), nullable=False, server_default='0'))
        
        if 'moderation_reason' not in existing_columns:
            batch_op.add_column(sa.Column('moderation_reason', sa.Text(), nullable=True))
        
        if 'updated_at' not in existing_columns:
            batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Crea tabella comment_like se non esiste
    existing_tables = inspector.get_table_names()
    
    if 'comment_like' not in existing_tables:
        op.create_table(
            'comment_like',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('comment_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.ForeignKeyConstraint(['comment_id'], ['comment.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('comment_id', 'user_id', name='unique_comment_like')
        )

    # Crea indici per performance
    with op.batch_alter_table('comment', schema=None) as batch_op:
        try:
            batch_op.create_index('idx_comment_article_parent', ['article_id', 'parent_id'])
        except:
            pass
        try:
            batch_op.create_index('idx_comment_status', ['status'])
        except:
            pass
        try:
            batch_op.create_index('idx_comment_reported', ['reported'])
        except:
            pass
    
    if 'comment_like' in inspector.get_table_names():
        with op.batch_alter_table('comment_like', schema=None) as batch_op:
            try:
                batch_op.create_index('idx_comment_like_comment', ['comment_id'])
            except:
                pass
            try:
                batch_op.create_index('idx_comment_like_user', ['user_id'])
            except:
                pass


def downgrade():
    # Rimuovi indici
    with op.batch_alter_table('comment_like', schema=None) as batch_op:
        batch_op.drop_index('idx_comment_like_user')
        batch_op.drop_index('idx_comment_like_comment')
    
    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.drop_index('idx_comment_reported')
        batch_op.drop_index('idx_comment_status')
        batch_op.drop_index('idx_comment_article_parent')
    
    # Rimuovi tabella comment_like
    op.drop_table('comment_like')
    
    # Rimuovi colonne da comment
    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.drop_constraint('fk_comment_parent_id', type_='foreignkey')
        batch_op.drop_column('updated_at')
        batch_op.drop_column('moderation_reason')
        batch_op.drop_column('reported')
        batch_op.drop_column('status')
        batch_op.drop_column('parent_id')
