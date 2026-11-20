from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_alter_usuario_id'),
    ]

    operations = [
        migrations.RenameField(model_name='usuario', old_name='id', new_name='usuario_id'),
        migrations.AlterField(
            model_name='usuario',
            name='usuario_id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]