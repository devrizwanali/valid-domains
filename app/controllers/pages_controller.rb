class PagesController < ApplicationController
  def domains
    @domains = Domain.all

    render json: @domains, status: :ok
  end

  def create
    @domain = Domain.new(domain_params)
    if @domain.save
      render json: @domain, status: :ok
    else
      render json: @domain.errors.full_messages, status: :unprocessable_entity
    end
  end

  private

  def domain_params
    params.require(:domain).permit(:name)
  end
end
