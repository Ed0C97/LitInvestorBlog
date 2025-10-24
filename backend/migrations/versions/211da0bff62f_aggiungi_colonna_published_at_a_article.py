"""Aggiungi colonna published_at a Article

Revision ID: 211da0bff62f
Revises: f0c3e9f827a4
Create Date: 2025-10-15 10:45:33.667368

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '211da0bff62f'
down_revision = 'f0c3e9f827a4'
branch_labels = None
depends_on = None


def upgrade():
    # ### comandi auto-generati da Alembic - please adjust! ###
    with op.batch_alter_table('article', schema=None) as batch_op:
        # Aggiunge la colonna 'published_at' alla tabella 'article'
        batch_op.add_column(sa.Column('published_at', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### comandi auto-generati da Alembic - please adjust! ###
    with op.batch_alter_table('article', schema=None) as batch_op:
        # Rimuove la colonna 'published_at' se vuoi annullare la modifica
        batch_op.drop_column('published_at')
    # ### end Alembic commands ###
