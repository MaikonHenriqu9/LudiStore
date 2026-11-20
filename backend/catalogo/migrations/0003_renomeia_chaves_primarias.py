from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogo', '0002_alter_brinquedo_id_alter_categoria_id_alter_marca_id'),
    ]

    operations = [
        migrations.RenameField(model_name='marca', old_name='id', new_name='marca_id'),
        migrations.AlterField(
            model_name='marca',
            name='marca_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.RenameField(model_name='categoria', old_name='id', new_name='categoria_id'),
        migrations.AlterField(
            model_name='categoria',
            name='categoria_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.RenameField(model_name='brinquedo', old_name='id', new_name='brinquedo_id'),
        migrations.AlterField(
            model_name='brinquedo',
            name='brinquedo_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]
    