migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')

    col.fields.add(
      new RelationField({
        name: 'contrato_origem',
        collectionId: col.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: false,
      }),
    )
    col.fields.add(
      new TextField({
        name: 'motivo_distrato',
      }),
    )
    col.fields.add(
      new DateField({
        name: 'data_distrato',
      }),
    )
    col.fields.add(
      new NumberField({
        name: 'valor_reembolso',
      }),
    )
    col.fields.add(
      new NumberField({
        name: 'multa_distrato',
      }),
    )

    col.addIndex('idx_contracts_contrato_origem', false, 'contrato_origem', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')

    col.removeIndex('idx_contracts_contrato_origem')
    col.removeField('contrato_origem')
    col.removeField('motivo_distrato')
    col.removeField('data_distrato')
    col.removeField('valor_reembolso')
    col.removeField('multa_distrato')

    app.save(col)
  },
)
